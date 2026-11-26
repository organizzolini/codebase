import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import {
  DEGREES_PER_LUNAR_PHASE,
  LUNAR_APSIS_SEARCH_STEP_MINUTES,
  LUNAR_PHASE_SEARCH_STEP_MINUTES,
} from "./monthly-lunar-cycle.constants";
import { MonthlyLunarCycleService } from "./monthly-lunar-cycle.service";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the lunar phase and apsis the sweep window cut off: where the phase
 * underway at its start began and where the last one ends, and the apsides
 * either side, so each phase and each approach or recession is a whole span.
 */
@Injectable()
export class MonthlyLunarCycleEdgesService implements EdgeEventsFinder {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
    private readonly monthlyLunarCycleService: MonthlyLunarCycleService,
  ) {
    this.logger.setContext(MonthlyLunarCycleEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Detects the apsis at a minute, from the Moon's radial speed around it. */
  private detectApsisAt(minute: Moment): DetectedCalendarEvent[] {
    const moonDistanceEphemeris = this.getMoonDistance(minute, 1);

    return this.monthlyLunarCycleService.detectApsides({
      minute,
      moonDistanceEphemeris,
    });
  }

  /** Detects the phase beginning at a minute, from the elongation around it. */
  private detectPhaseAt(minute: Moment): DetectedCalendarEvent[] {
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: ["moon", "sun"],
      end: minute.clone().add(1, "minute"),
      start: minute.clone().subtract(1, "minute"),
      timezone: "UTC",
    });

    return this.monthlyLunarCycleService.detect({
      minute,
      moonCoordinateEphemeris: ephemeris.moon,
      sunCoordinateEphemeris: ephemeris.sun,
    });
  }

  /**
   * The Moon's elongation from the Sun at a minute, in [0, 360): its apparent
   * ecliptic longitude minus the Sun's.
   */
  private getElongation(minute: Moment): number {
    const timestamp = minute.toISOString();
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: ["moon", "sun"],
      end: minute,
      start: minute,
      timezone: "UTC",
    });
    const longitude = (body: "moon" | "sun"): number =>
      this.ephemerisService.getCoordinateFromEphemeris(
        ephemeris[body],
        timestamp,
        "longitude",
      );

    return (((longitude("moon") - longitude("sun")) % 360) + 360) % 360;
  }

  /**
   * The Moon's distance and radial speed at a minute and as many minutes
   * either side.
   */
  private getMoonDistance(
    minute: Moment,
    margin: number,
  ): ReturnType<EphemerisService["getDistanceEphemerisByBody"]>["moon"] {
    return this.ephemerisService.getDistanceEphemerisByBody({
      bodies: ["moon"],
      end: minute.clone().add(margin, "minutes"),
      start: minute.clone().subtract(margin, "minutes"),
      timezone: "UTC",
    }).moon;
  }

  // 🌎 Public Methods

  /**
   * The phase and apsis events just outside the window, by the octant of the
   * Moon's elongation and its radial speed's sign.
   */
  findEdgeEvents(window: SweepWindow): DetectedCalendarEvent[] {
    return [
      ...this.boundarySearchService.findEdgeEvents({
        detectAt: (minute) => this.detectPhaseAt(minute),
        stateAt: (minute) =>
          Math.floor(this.getElongation(minute) / DEGREES_PER_LUNAR_PHASE),
        stepMinutes: LUNAR_PHASE_SEARCH_STEP_MINUTES,
        window,
      }),
      ...this.boundarySearchService.findEdgeEvents({
        detectAt: (minute) => this.detectApsisAt(minute),
        stateAt: (minute) =>
          this.ephemerisService.getDistanceSpeedFromEphemeris(
            this.getMoonDistance(minute, 0),
            minute.toISOString(),
          ) > 0,
        stepMinutes: LUNAR_APSIS_SEARCH_STEP_MINUTES,
        window,
      }),
    ];
  }
}
