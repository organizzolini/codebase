import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../../../ephemeris/modules/boundary-search/boundary-search.service";
import { TWILIGHT_SEARCH_STEP_MINUTES } from "../../twilights.constants";
import { TwilightsService } from "../../twilights.service";

import type { DetectedCalendarEvent } from "../../../../../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../../../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Input } from "../../../../../input/input.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the twilight boundary the sweep window cut off on each side, so the
 * twilight, daylight or night underway at its start or end is a whole span.
 */
@Injectable()
export class TwilightsEdgesService implements EdgeEventsFinder {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
    private readonly twilightsService: TwilightsService,
  ) {
    this.logger.setContext(TwilightsEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The Sun's horizon positions at the observer, a minute either side. */
  private getSunHorizon(
    input: Input,
    minute: Moment,
    margin: number,
  ): ReturnType<EphemerisService["getAzimuthElevationEphemerisByBody"]>["sun"] {
    return this.ephemerisService.getAzimuthElevationEphemerisByBody({
      bodies: ["sun"],
      coordinates: [input.longitude, input.latitude],
      end: minute.clone().add(margin, "minutes"),
      start: minute.clone().subtract(margin, "minutes"),
      timezone: "UTC",
    }).sun;
  }

  /**
   * Which band of the twilights the Sun is in at a minute: below astronomical
   * twilight, in it, in nautical twilight, or above civil twilight.
   */
  private getTwilightBand(input: Input, minute: Moment): number {
    const elevation = this.ephemerisService.getAzimuthElevationFromEphemeris(
      this.getSunHorizon(input, minute, 0),
      minute.toISOString(),
      "elevation",
    );

    return [-18, -12, -6].filter((threshold) => elevation > threshold).length;
  }

  // 🌎 Public Methods

  /**
   * The twilight transitions just outside the window, where the Sun's band
   * against -18°, -12° and -6° changes.
   */
  findEdgeEvents(window: SweepWindow, input: Input): DetectedCalendarEvent[] {
    return this.boundarySearchService.findEdgeEvents({
      detectAt: (minute) =>
        this.twilightsService.detect({
          minute,
          sunAzimuthElevationEphemeris: this.getSunHorizon(input, minute, 1),
        }),
      stateAt: (minute) => this.getTwilightBand(input, minute),
      stepMinutes: TWILIGHT_SEARCH_STEP_MINUTES,
      window,
    });
  }
}
