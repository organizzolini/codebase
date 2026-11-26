import { Inject, Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { aspects, bodies } from "../../../caelundas/caelundas.constants";
import {
  bodyFromDisplayName,
  isAspect,
} from "../../../caelundas/caelundas.types";
import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";
import {
  ASPECT_SEARCH_FAST_STEP_MINUTES,
  ASPECT_SEARCH_SLOW_STEP_MINUTES,
  CLIPPED_NEIGHBOR_OFFSETS_DEGREES,
  SIMPLE_ASPECT_DETECTORS_TOKEN,
  SLOW_ASPECT_BODIES,
} from "../../aspects.constants";
import { AspectsUtilitiesService } from "../utilities/aspects-utilities.service";

import type { Aspect, Body } from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../../../ephemeris/ephemeris.types";
import type { SweepWindow } from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { AspectBodies, SimpleAspectDetector } from "../../aspects.types";
import type { AspectEdge, AspectGroup, Boundary } from "./aspect-edges.types";
import type { Moment } from "moment-timezone";

/**
 * Completes the simple aspects a sweep window cuts off: finds, by walking the
 * ephemeris, the minute an aspect in orb at the window start began or one in
 * orb at its end stops.
 */
@Injectable()
export class AspectEdgesService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(SIMPLE_ASPECT_DETECTORS_TOKEN)
    private readonly simpleAspectDetectors: SimpleAspectDetector[],
    private readonly aspectsUtilitiesService: AspectsUtilitiesService,
    private readonly boundarySearchService: BoundarySearchService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AspectEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds the boundary event the detectors give a pair at a minute;
   * undefined, with a warning, when they give none.
   */
  private buildBoundaryEvent(
    group: AspectGroup,
    boundary: Boundary,
    edge: AspectEdge,
  ): DetectedCalendarEvent | undefined {
    const { isClipped, minute } = edge;
    const around = this.getEphemerisAround(minute);
    const coordinateEphemerisByBody = isClipped
      ? this.clipEphemeris({ boundary, ephemeris: around, group, minute })
      : around;
    const label = boundary === "forming" ? "Forming" : "Dissolving";
    const event = this.simpleAspectDetectors
      .flatMap((detector) =>
        detector.detect({ coordinateEphemerisByBody, minute }),
      )
      .find((candidate) => {
        const parsed = this.parseBoundary(candidate);
        return (
          parsed !== undefined &&
          this.keyOf(parsed.aspect, parsed.bodies) ===
            this.keyOf(group.aspect, group.bodies) &&
          candidate.tags.includes(label)
        );
      });

    if (event === undefined) {
      this.logger.warn("📐 Left an aspect edge without a boundary", undefined, {
        aspect: group.aspect,
        at: minute.toISOString(),
        bodies: group.bodies,
        boundary,
      });
    }

    return event;
  }

  /**
   * The ephemeris around a range's first or last minute, with the first body's
   * neighbor outside it moved out of every orb.
   */
  private clipEphemeris(args: {
    boundary: Boundary;
    ephemeris: Record<Body, CoordinateEphemeris>;
    group: AspectGroup;
    minute: Moment;
  }): Record<Body, CoordinateEphemeris> {
    const { boundary, ephemeris, group, minute } = args;
    const [body1, body2] = group.bodies;
    const neighbor = minute
      .clone()
      .add(boundary === "forming" ? -1 : 1, "minute")
      .toISOString();
    const own = ephemeris[body1][neighbor];
    const partner = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris[body2],
      minute.toISOString(),
      "longitude",
    );
    const longitude =
      CLIPPED_NEIGHBOR_OFFSETS_DEGREES.map(
        (offset) => ((own?.longitude ?? 0) + offset) % 360,
      ).find((candidate) =>
        aspects.every(
          (aspect) =>
            !this.aspectsUtilitiesService.isAspect({
              aspect,
              longitudeBody1: candidate,
              longitudeBody2: partner,
            }),
        ),
      ) ?? 0;

    return {
      ...ephemeris,
      [body1]: {
        ...ephemeris[body1],
        [neighbor]: { latitude: own?.latitude ?? 0, longitude },
      },
    };
  }

  /**
   * The boundary events one pair's aspect lacks, at the window start and end.
   */
  private completeGroup(
    group: AspectGroup,
    window: SweepWindow,
  ): DetectedCalendarEvent[] {
    const ordered = group.boundaries.toSorted(
      (first, second) => first.minute.valueOf() - second.minute.valueOf(),
    );
    const first = ordered.at(0)?.boundary;
    const last = ordered.at(-1)?.boundary;
    const beginsBeforeWindow = first === undefined || first === "dissolving";
    const endsAfterWindow = last === undefined || last === "forming";

    return [
      ...(beginsBeforeWindow ? [["forming", -1] as const] : []),
      ...(endsAfterWindow ? [["dissolving", 1] as const] : []),
    ].flatMap(([boundary, search]) => {
      const edge = this.findEdge({ group, search, window });
      const event =
        edge === undefined
          ? undefined
          : this.buildBoundaryEvent(group, boundary, edge);

      return event === undefined ? [] : [event];
    });
  }

  /**
   * The edge of a pair's orb, searching from a window edge; the range's first
   * or last minute when clipped.
   */
  private findEdge(args: {
    group: AspectGroup;
    search: -1 | 1;
    window: SweepWindow;
  }): AspectEdge | undefined {
    const { group, search, window } = args;
    const from = search === -1 ? window.start : window.end;
    if (!this.isInOrb(group, from)) {
      return undefined;
    }
    const slow = group.bodies.every((body) =>
      SLOW_ASPECT_BODIES.includes(body),
    );
    const limit = this.boundarySearchService.getLimit(search, from);
    const bracket = this.boundarySearchService.find({
      direction: search,
      from,
      isInside: (minute) => this.isInOrb(group, minute),
      limit,
      stepMinutes: slow
        ? ASPECT_SEARCH_SLOW_STEP_MINUTES
        : ASPECT_SEARCH_FAST_STEP_MINUTES,
    });

    return bracket === undefined
      ? { isClipped: true, minute: limit }
      : { isClipped: false, minute: bracket.inside };
  }

  /**
   * Every body's coordinates at a minute and its neighbors, which is what the
   * detectors read.
   */
  private getEphemerisAround(
    minute: Moment,
  ): Record<Body, CoordinateEphemeris> {
    return this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [...bodies],
      end: minute.clone().add(1, "minute"),
      start: minute.clone().subtract(1, "minute"),
      timezone: "UTC",
    });
  }

  /**
   * Groups the simple aspects' boundaries by body pair and aspect, adding an
   * empty group for each aspect in orb at the window start.
   */
  private groupBoundaries(
    events: DetectedCalendarEvent[],
    active: AspectBodies[],
  ): AspectGroup[] {
    const groups = new Map<string, AspectGroup>();

    for (const { aspect, bodies: pair } of active) {
      groups.set(this.keyOf(aspect, pair), {
        aspect,
        bodies: pair,
        boundaries: [],
      });
    }

    for (const event of events) {
      const parsed = this.parseBoundary(event);
      if (parsed === undefined) {
        continue;
      }
      const key = this.keyOf(parsed.aspect, parsed.bodies);
      const group = groups.get(key) ?? {
        aspect: parsed.aspect,
        bodies: parsed.bodies,
        boundaries: [],
      };
      group.boundaries.push({
        boundary: parsed.boundary,
        minute: event.start,
      });
      groups.set(key, group);
    }

    return [...groups.values()];
  }

  /** Whether a pair is within orb of the aspect at one minute. */
  private isInOrb(group: AspectGroup, minute: Moment): boolean {
    const [body1, body2] = group.bodies;
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [body1, body2],
      end: minute,
      start: minute,
      timezone: "UTC",
    });
    const longitude = (body: Body): number =>
      this.ephemerisService.getCoordinateFromEphemeris(
        ephemeris[body],
        minute.toISOString(),
        "longitude",
      );

    return this.aspectsUtilitiesService.isAspect({
      aspect: group.aspect,
      longitudeBody1: longitude(body1),
      longitudeBody2: longitude(body2),
    });
  }

  /** A key shared by an aspect's events whatever order its bodies came in. */
  private keyOf(aspect: Aspect, pair: readonly Body[]): string {
    return [aspect, ...pair.toSorted()].join("\u001F");
  }

  /**
   * Reads a simple aspect's forming or dissolving event; undefined for any
   * other event.
   */
  private parseBoundary(
    event: DetectedCalendarEvent,
  ): undefined | { aspect: Aspect; bodies: [Body, Body]; boundary: Boundary } {
    const forming = event.tags.includes("Forming");
    const [body1, body2, ...rest] = event.tags
      .map((tag) => bodyFromDisplayName(tag))
      .filter((body) => body !== undefined);
    const aspect = event.tags
      .map((tag) => tag.toLowerCase())
      .find((tag): tag is Aspect => isAspect(tag));

    if (
      !event.tags.includes("Simple Aspect") ||
      forming === event.tags.includes("Dissolving") ||
      aspect === undefined ||
      body1 === undefined ||
      body2 === undefined ||
      rest.length > 0
    ) {
      return undefined;
    }

    return {
      aspect,
      bodies: [body1, body2],
      boundary: forming ? "forming" : "dissolving",
    };
  }

  // 🌎 Public Methods

  /**
   * The forming and dissolving events a sweep window cut off, at their true
   * minutes.
   */
  complete(
    events: DetectedCalendarEvent[],
    window: SweepWindow,
  ): DetectedCalendarEvent[] {
    const minute = window.start;
    const coordinateEphemerisByBody = this.getEphemerisAround(minute);
    const active = this.simpleAspectDetectors.flatMap((detector) =>
      detector.detectActive({ coordinateEphemerisByBody, minute }),
    );
    const edgeEvents = this.groupBoundaries(events, active).flatMap((group) =>
      this.completeGroup(group, window),
    );

    this.logger.debug("📐 Completed aspect edges", undefined, {
      count: edgeEvents.length,
    });

    return edgeEvents;
  }
}
