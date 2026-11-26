import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import { DailyCyclesBuilderService } from "./daily-cycles-builder.service";
import { MOON_SEARCH_STEP_MINUTES } from "./daily-cycles.constants";
import { DailyCyclesService } from "./daily-cycles.service";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { AzimuthElevationEphemeris } from "../../../ephemeris/ephemeris.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Input } from "../../../input/input.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the moonrise or moonset the sweep window cut off on each side, so the
 * span the Moon is up at the window's start or end is a whole one.
 */
@Injectable()
export class DailyCyclesEdgesService implements EdgeEventsFinder {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly dailyCyclesBuilderService: DailyCyclesBuilderService,
    private readonly dailyCyclesService: DailyCyclesService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DailyCyclesEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The Moon's horizon positions at the observer, a minute either side. */
  private getMoonHorizon(
    input: Input,
    minute: Moment,
  ): AzimuthElevationEphemeris {
    return this.ephemerisService.getAzimuthElevationEphemerisByBody({
      bodies: ["moon"],
      coordinates: [input.longitude, input.latitude],
      end: minute.clone().add(1, "minute"),
      start: minute.clone().subtract(1, "minute"),
      timezone: "UTC",
    }).moon;
  }

  // 🌎 Public Methods

  /**
   * The moonrise and moonset just outside the window: the Moon is up while its
   * upper limb clears the horizon.
   */
  findEdgeEvents(window: SweepWindow, input: Input): DetectedCalendarEvent[] {
    return this.boundarySearchService.findEdgeEvents({
      detectAt: (minute) =>
        this.dailyCyclesService.getDailyLunarCycleEvents({
          minute,
          moonAzimuthElevationEphemeris: this.getMoonHorizon(input, minute),
        }),
      isBoundary: (event) =>
        event.tags.includes("Moonrise") || event.tags.includes("Moonset"),
      stateAt: (minute) =>
        this.dailyCyclesBuilderService.getHorizonClearanceWindow({
          body: "moon",
          ephemeris: this.getMoonHorizon(input, minute),
          minute,
        }).current > 0,
      stepMinutes: MOON_SEARCH_STEP_MINUTES,
      window,
    });
  }
}
