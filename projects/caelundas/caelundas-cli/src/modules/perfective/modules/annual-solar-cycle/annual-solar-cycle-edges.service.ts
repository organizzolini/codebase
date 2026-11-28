import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import {
  DEGREES_PER_SEASON,
  DEGREES_PER_SOLAR_YEAR_POINT,
  SOLAR_SEARCH_STEP_MINUTES,
} from "./annual-solar-cycle.constants";
import { AnnualSolarCycleService } from "./annual-solar-cycle.service";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the points of the Sun's year and the apsis a sweep window cut off, so
 * the season, the pre- and post- interval and the advancing or retreating
 * underway at its start or end are whole spans.
 */
@Injectable()
export class AnnualSolarCycleEdgesService implements EdgeEventsFinder {
  // 🏗 Dependency Injection

  constructor(
    private readonly annualSolarCycleService: AnnualSolarCycleService,
    private readonly boundarySearchService: BoundarySearchService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AnnualSolarCycleEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Detects the apsis at a minute, from the Sun's radial speed around it. */
  private detectApsisAt(minute: Moment): DetectedCalendarEvent[] {
    return this.annualSolarCycleService.getSolarApsisEvents({
      minute,
      sunDistanceEphemeris: this.getSunDistance(minute, 1),
    });
  }

  /** Detects the point of the year reached at a minute. */
  private detectPointAt(minute: Moment): DetectedCalendarEvent[] {
    return this.annualSolarCycleService.getAnnualSolarCycleEvents({
      minute,
      sunCoordinateEphemeris:
        this.ephemerisService.getCoordinateEphemerisByBody({
          bodies: ["sun"],
          end: minute,
          start: minute.clone().subtract(1, "minute"),
          timezone: "UTC",
        }).sun,
    });
  }

  /** The Sun's distance and radial speed at a minute and as many either side. */
  private getSunDistance(
    minute: Moment,
    margin: number,
  ): ReturnType<EphemerisService["getDistanceEphemerisByBody"]>["sun"] {
    return this.ephemerisService.getDistanceEphemerisByBody({
      bodies: ["sun"],
      end: minute.clone().add(margin, "minutes"),
      start: minute.clone().subtract(margin, "minutes"),
      timezone: "UTC",
    }).sun;
  }

  /** The Sun's ecliptic longitude at a minute. */
  private getSunLongitude(minute: Moment): number {
    return this.ephemerisService.getCoordinateFromEphemeris(
      this.ephemerisService.getCoordinateEphemerisByBody({
        bodies: ["sun"],
        end: minute,
        start: minute,
        timezone: "UTC",
      }).sun,
      minute.toISOString(),
      "longitude",
    );
  }

  // 🌎 Public Methods

  /**
   * The point of the year, season start and apsis just outside the window, by
   * the Sun's longitude slice and radial speed.
   */
  findEdgeEvents(window: SweepWindow): DetectedCalendarEvent[] {
    const sliceOf =
      (degrees: number) =>
      (minute: Moment): number =>
        Math.floor(this.getSunLongitude(minute) / degrees);

    return [
      ...this.boundarySearchService.findEdgeEvents({
        detectAt: (minute) => this.detectPointAt(minute),
        stateAt: sliceOf(DEGREES_PER_SOLAR_YEAR_POINT),
        stepMinutes: SOLAR_SEARCH_STEP_MINUTES,
        window,
      }),
      ...this.boundarySearchService.findEdgeEvents({
        detectAt: (minute) => this.detectPointAt(minute),
        stateAt: sliceOf(DEGREES_PER_SEASON),
        stepMinutes: SOLAR_SEARCH_STEP_MINUTES,
        window,
      }),
      ...this.boundarySearchService.findEdgeEvents({
        detectAt: (minute) => this.detectApsisAt(minute),
        stateAt: (minute) =>
          this.ephemerisService.getDistanceSpeedFromEphemeris(
            this.getSunDistance(minute, 0),
            minute.toISOString(),
          ) > 0,
        stepMinutes: SOLAR_SEARCH_STEP_MINUTES,
        window,
      }),
    ];
  }
}
