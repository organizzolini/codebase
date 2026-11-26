import { Injectable } from "@nestjs/common";
import moment from "moment-timezone";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";
import { MathService } from "../../../ephemeris/modules/math/math.service";

import {
  ELONGATION_BODIES,
  ELONGATION_TAGS,
  MARS_BOUNDARY_TAGS,
  PHASE_DETECTION_MARGIN_MINUTES,
  PHASE_PLANETS,
  RISE_SET_ELONGATION_DEGREES,
  RISE_SET_TAGS,
  VISIBILITY_SEARCH_STEP_MINUTES,
} from "./phases.constants";
import { PhasesService } from "./phases.service";

import type { Body } from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Input } from "../../../input/input.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the rise, set and greatest elongation of Mercury and Venus, and the
 * rise, opposition and set of Mars, the sweep window cut off, so the
 * apparition underway at its start or end, and each half of it, is a whole
 * span.
 */
@Injectable()
export class PhasesEdgesService implements EdgeEventsFinder {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
    private readonly mathService: MathService,
    private readonly phasesService: PhasesService,
  ) {
    this.logger.setContext(PhasesEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Detects the phase events a planet has at a minute, from the ephemeris a
   * sweep would have read around it.
   */
  private detectAt(
    planet: (typeof PHASE_PLANETS)[number],
    input: Input,
    minute: Moment,
  ): DetectedCalendarEvent[] {
    const range = {
      end: minute.clone().add(PHASE_DETECTION_MARGIN_MINUTES, "minutes"),
      start: minute.clone().subtract(PHASE_DETECTION_MARGIN_MINUTES, "minutes"),
      timezone: "UTC",
    };
    const coordinates = this.ephemerisService.getCoordinateEphemerisByBody({
      ...range,
      bodies: [planet, "sun"],
    });
    const sunCoordinateEphemeris = coordinates.sun;
    const coordinate = coordinates[planet];
    const illumination = this.ephemerisService.getIlluminationEphemerisByBody({
      ...range,
      bodies: [planet],
      coordinates: [input.longitude, input.latitude],
    })[planet];

    if (planet === "mars") {
      return this.phasesService.getMartianPhaseEvents({
        marsCoordinateEphemeris: coordinate,
        marsIlluminationEphemeris: illumination,
        minute,
        sunCoordinateEphemeris,
      });
    }

    if (planet === "mercury") {
      return this.phasesService.getMercurianPhaseEvents({
        mercuryCoordinateEphemeris: coordinate,
        mercuryIlluminationEphemeris: illumination,
        minute,
        sunCoordinateEphemeris,
      });
    }

    return this.phasesService.getVenusianPhaseEvents({
      minute,
      sunCoordinateEphemeris,
      venusCoordinateEphemeris: coordinate,
      venusIlluminationEphemeris: illumination,
    });
  }

  /**
   * The greatest elongation of the apparition holding an edge: where the
   * planet's separation from the Sun peaks between its rise and set.
   */
  private findElongation(args: {
    edge: Moment;
    input: Input;
    planet: (typeof PHASE_PLANETS)[number];
    window: SweepWindow;
  }): DetectedCalendarEvent | undefined {
    const { edge, input, planet, window } = args;
    const state = this.getVisibility(planet, edge);

    if (state === 0) {
      return undefined;
    }

    const search = (direction: -1 | 1): Moment | undefined =>
      this.boundarySearchService.findBeyondLimit({
        direction,
        from: edge,
        isInside: (minute) => this.getVisibility(planet, minute) === state,
        stepMinutes: VISIBILITY_SEARCH_STEP_MINUTES,
      })?.inside;
    const first = search(-1);
    const last = search(1);

    if (first === undefined || last === undefined) {
      return undefined;
    }

    const peak = this.findPeak(planet, first, last);

    for (const offset of [0, 1, -1, 2, -2, 3, -3]) {
      const event = this.detectAt(
        planet,
        input,
        peak.clone().add(offset, "minutes"),
      ).find((candidate) =>
        ELONGATION_TAGS.some((tag) => candidate.tags.includes(tag)),
      );
      if (event !== undefined) {
        return this.boundarySearchService.clip(event, window);
      }
    }

    return undefined;
  }

  /**
   * The minute a planet's separation from the Sun peaks between two minutes,
   * narrowed by thirds, as it rises then falls once in an apparition.
   */
  private findPeak(planet: Body, first: Moment, last: Moment): Moment {
    let low = first.valueOf();
    let high = last.valueOf();
    const minute = 60_000;

    while (high - low > 5 * minute) {
      const third = Math.trunc((high - low) / 3 / minute) * minute;
      const lower = low + third;
      const upper = high - third;
      if (
        this.getSeparation(planet, moment.utc(lower)) <
        this.getSeparation(planet, moment.utc(upper))
      ) {
        low = lower;
      } else {
        high = upper;
      }
    }

    return moment.utc(Math.trunc((low + high) / 2 / minute) * minute);
  }

  /** The planet's angular separation from the Sun at a minute, latitude too. */
  private getSeparation(planet: Body, minute: Moment): number {
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [planet, "sun"],
      end: minute,
      start: minute,
      timezone: "UTC",
    });
    const position = (body: Body): [number, number] => [
      this.ephemerisService.getCoordinateFromEphemeris(
        ephemeris[body],
        minute.toISOString(),
        "longitude",
      ),
      this.ephemerisService.getCoordinateFromEphemeris(
        ephemeris[body],
        minute.toISOString(),
        "latitude",
      ),
    ];

    return this.mathService.getAngularSeparation(
      position(planet),
      position("sun"),
    );
  }

  /**
   * Whether a planet is out of the Sun's glare at a minute: 0 within 6° of it,
   * 1 east (evening), 2 west (morning).
   */
  private getVisibility(planet: Body, minute: Moment): number {
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [planet, "sun"],
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
    const signed =
      this.mathService.normalizeDegrees(
        longitude(planet) - longitude("sun") + 180,
      ) - 180;

    if (Math.abs(signed) < RISE_SET_ELONGATION_DEGREES) {
      return 0;
    }

    return signed > 0 ? 1 : 2;
  }

  // 🌎 Public Methods

  /**
   * The rise and set just outside the window, and the greatest elongation of
   * the apparition at each edge.
   */
  findEdgeEvents(window: SweepWindow, input: Input): DetectedCalendarEvent[] {
    return PHASE_PLANETS.flatMap((planet) => [
      ...this.boundarySearchService.findEdgeEvents({
        detectAt: (minute) => this.detectAt(planet, input, minute),
        isBoundary: (event) =>
          (planet === "mars" ? MARS_BOUNDARY_TAGS : RISE_SET_TAGS).some((tag) =>
            event.tags.includes(tag),
          ),
        stateAt: (minute) => this.getVisibility(planet, minute),
        stepMinutes: VISIBILITY_SEARCH_STEP_MINUTES,
        window,
      }),
      ...(ELONGATION_BODIES.has(planet)
        ? [window.start, window.end].flatMap((edge) => {
            const event = this.findElongation({ edge, input, planet, window });

            return event === undefined ? [] : [event];
          })
        : []),
    ]);
  }
}
