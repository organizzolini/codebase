import { Inject, Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { bodies } from "../caelundas/caelundas.constants";
import { isAspect } from "../caelundas/caelundas.types";

import {
  COMPOSITE_ASPECT_DETECTORS_TOKEN,
  PROGRESSIVE_ASPECT_DETECTORS_TOKEN,
  SIMPLE_ASPECT_DETECTORS_TOKEN,
} from "./aspects.constants";
import { AspectEdgesService } from "./modules/calculation/aspect-edges.service";

import type { Aspect, Body } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type { SweepWindow } from "../ephemeris/modules/boundary-search/boundary-search.types";
import type {
  AspectBodies,
  CompositeAspectDetector,
  ProgressiveAspectDetector,
  SimpleAspectDetector,
  SimpleAspectDetectorArguments,
} from "./aspects.types";
import type { Moment } from "moment-timezone";

/**
 * Orchestrates aspect detection across all aspect-type services.
 *
 * Delegates 2-body detection (major, minor, specialty) and composes results into
 * multi-body patterns (T-squares, grand trines, yods, stelliums) via the
 * respective sub-services. Also coordinates progressive event pairing.
 */
@Injectable()
export class AspectsService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(SIMPLE_ASPECT_DETECTORS_TOKEN)
    private readonly simpleAspectDetectors: SimpleAspectDetector[],
    @Inject(COMPOSITE_ASPECT_DETECTORS_TOKEN)
    private readonly compositeAspectDetectors: CompositeAspectDetector[],
    @Inject(PROGRESSIVE_ASPECT_DETECTORS_TOKEN)
    private readonly progressiveAspectDetectors: ProgressiveAspectDetector[],
    private readonly aspectEdgesService: AspectEdgesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AspectsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Applies a forming or dissolving simple-aspect event to the active aspect snapshot map. */
  private applyEventToMap(
    map: Map<string, AspectBodies>,
    event: DetectedCalendarEvent,
    lowercaseBodies: string[],
  ): void {
    const parsed = this.parseSimpleAspectEvent(event, lowercaseBodies);
    if (!parsed) return;
    const { aspect, body1, body2, isDissolving } = parsed;
    const key = this.makeKey(body1, body2, aspect);
    if (isDissolving) {
      map.delete(key);
    } else if (!map.has(key)) {
      map.set(key, { aspect, bodies: [body1, body2] });
    }
  }

  /**
   * Keys a compound event by minute and sorted tags, ignoring the body order
   * its title used.
   */
  private compoundEventKey(event: DetectedCalendarEvent): string {
    return [event.start.valueOf(), ...event.tags.toSorted()].join("\u001F");
  }

  /** Runs composite-aspect detectors against current and previous aspect-body snapshots. */
  private detectCompositeAspects(
    currentAspectBodies: AspectBodies[],
    minute: Moment,
    previousAspectBodies: AspectBodies[],
  ): DetectedCalendarEvent[] {
    const sharedArguments = {
      currentAspectBodies,
      minute,
      previousAspectBodies,
    };
    const eventsByKey = new Map<string, DetectedCalendarEvent>();
    for (const compositeAspectDetector of this.compositeAspectDetectors) {
      for (const event of compositeAspectDetector.detect(sharedArguments)) {
        const key = this.compoundEventKey(event);
        if (!eventsByKey.has(key)) {
          eventsByKey.set(key, event);
        }
      }
    }
    return [...eventsByKey.values()];
  }

  /**
   * Replays the simple aspects' boundaries in order, detecting the compound
   * events each registry change makes outside the window or at a clipped edge.
   */
  private detectCompoundEdges(
    boundaries: DetectedCalendarEvent[],
    edgeEvents: DetectedCalendarEvent[],
    window: SweepWindow,
  ): DetectedCalendarEvent[] {
    const isEdge = new Set(edgeEvents);
    const byMinute = _.groupBy(
      boundaries.filter(
        (event) =>
          event.tags.includes("Simple Aspect") &&
          (event.tags.includes("Forming") || event.tags.includes("Dissolving")),
      ),
      (event) => event.start.valueOf(),
    );
    let registry: AspectBodies[] = [];

    return Object.entries(byMinute)
      .toSorted(([first], [second]) => Number(first) - Number(second))
      .flatMap(([, changes]) => {
        const minute = changes[0]?.start;
        const previous = registry;
        registry = this.computeAspectBodies(previous, changes);

        return minute === undefined ||
          (minute.isBetween(window.start, window.end, undefined, "[]") &&
            !changes.some((change) => isEdge.has(change)))
          ? []
          : this.detectCompositeAspects(registry, minute, previous);
      });
  }

  /** Runs all simple-aspect detectors for a minute and flattens their detected events. */
  private detectSimpleAspects(
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>,
    minute: Moment,
  ): DetectedCalendarEvent[] {
    const detectedEvents: DetectedCalendarEvent[] = [];
    for (const simpleAspectDetector of this.simpleAspectDetectors) {
      detectedEvents.push(
        ...simpleAspectDetector.detect({ coordinateEphemerisByBody, minute }),
      );
    }
    return detectedEvents;
  }

  /** Extracts celestial bodies referenced in normalized event tags. */
  private extractEventBodies(
    normalizedTags: string[],
    lowercaseBodies: string[],
  ): Body[] {
    return normalizedTags.flatMap((tag) =>
      bodies.filter((_body, index) => lowercaseBodies[index] === tag),
    );
  }

  /** Creates an order-insensitive compound key for a body pair and aspect type. */
  private makeKey(body1: Body, body2: Body, aspect: Aspect): string {
    const [sortedBody1, sortedBody2] = [body1, body2].toSorted();
    return `${sortedBody1}\u001F${sortedBody2}\u001F${aspect}`;
  }

  /** Parses a simple-aspect event into typed bodies, aspect, and phase direction flags. */
  private parseSimpleAspectEvent(
    event: DetectedCalendarEvent,
    lowercaseBodies: string[],
  ): null | {
    aspect: Aspect;
    body1: Body;
    body2: Body;
    isDissolving: boolean;
  } {
    const cats = event.tags.map((c) => c.toLowerCase().trim());
    if (!cats.includes("simple aspect")) return null;
    const isForming = cats.includes("forming");
    const isDissolving = cats.includes("dissolving");
    if (!isForming && !isDissolving) return null;
    const eventBodies = this.extractEventBodies(cats, lowercaseBodies);
    if (eventBodies.length !== 2) return null;
    const aspect = cats.find((c): c is Aspect => isAspect(c));
    const body1 = eventBodies[0];
    const body2 = eventBodies[1];
    if (!aspect || !body1 || !body2) return null;
    return { aspect, body1, body2, isDissolving };
  }

  // 🌎 Public Methods

  /**
   * Updates the active two-body aspect registry from the minute's Simple Aspect
   * events: forming adds, dissolving removes.
   */
  computeAspectBodies(
    previousAspectBodies: AspectBodies[],
    events: DetectedCalendarEvent[],
  ): AspectBodies[] {
    const map = new Map<string, AspectBodies>(
      previousAspectBodies.map((ab) => [
        this.makeKey(ab.bodies[0], ab.bodies[1], ab.aspect),
        ab,
      ]),
    );
    const lowercaseBodies = bodies.map((body) => body.toLowerCase());
    for (const event of events) {
      this.applyEventToMap(map, event, lowercaseBodies);
    }
    return [...map.values()];
  }

  /**
   * Detects all aspect events at a minute: simple aspects first, then composites
   * (triple through stellium) from the updated registry.
   */
  detect(args: {
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
    previousAspectBodies: AspectBodies[];
  }): { aspectBodies: AspectBodies[]; events: DetectedCalendarEvent[] } {
    const { coordinateEphemerisByBody, minute, previousAspectBodies } = args;
    const simpleAspectEvents = this.detectSimpleAspects(
      coordinateEphemerisByBody,
      minute,
    );
    const currentAspectBodies = this.computeAspectBodies(
      previousAspectBodies,
      simpleAspectEvents,
    );
    const compositeEvents = this.detectCompositeAspects(
      currentAspectBodies,
      minute,
      previousAspectBodies,
    );
    const events: DetectedCalendarEvent[] = [
      ...simpleAspectEvents,
      ...compositeEvents,
    ];
    this.logger.debug("🔍 Detected aspect events", undefined, {
      count: events.length,
    });
    return { aspectBodies: currentAspectBodies, events };
  }

  /**
   * Pairs forming and dissolving events into spans; given the sweep window,
   * first completes the aspects it cuts off.
   */
  detectProgressive(
    events: DetectedCalendarEvent[],
    window?: SweepWindow,
  ): DetectedCalendarEvent[] {
    const simpleEdges =
      window === undefined
        ? []
        : this.aspectEdgesService.complete(events, window);
    const withSimpleEdges = [...events, ...simpleEdges];
    // A compound begins at the latest forming of its aspects and ends at the
    // earliest dissolving, so the boundaries just found make its edges.
    const completed =
      window === undefined
        ? events
        : [
            ...withSimpleEdges,
            ...this.detectCompoundEdges(withSimpleEdges, simpleEdges, window),
          ];
    const progressiveEvents: DetectedCalendarEvent[] = [];
    for (const progressiveAspectDetector of this.progressiveAspectDetectors) {
      progressiveEvents.push(
        ...progressiveAspectDetector.detectProgressive(completed),
      );
    }
    this.logger.debug("🔍 Detected progressive aspect events", undefined, {
      count: progressiveEvents.length,
    });
    return progressiveEvents;
  }

  /**
   * The aspects already in orb when a sweep starts at `minute`; a compound they
   * make began when its last aspect formed.
   */
  seed(args: SimpleAspectDetectorArguments): AspectBodies[] {
    const aspectBodies = this.simpleAspectDetectors.flatMap(
      (simpleAspectDetector) => simpleAspectDetector.detectActive(args),
    );
    this.logger.debug("🌱 Seeded the active aspects", undefined, {
      aspects: aspectBodies.length,
    });
    return aspectBodies;
  }
}
