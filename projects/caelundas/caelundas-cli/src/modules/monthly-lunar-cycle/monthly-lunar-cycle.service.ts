import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { lunarPhases } from "../caelundas/caelundas.constants";
import { isLunarPhase } from "../caelundas/caelundas.types";
import { symbolByLunarPhase } from "../caelundas/symbol-caelundas.constants";
import { CalendarService } from "../calendar/calendar.service";
import { EphemerisService } from "../ephemeris/ephemeris.service";

import { LunarApsidesService } from "./lunar-apsides.service";
import { ELONGATION_BY_LUNAR_PHASE } from "./monthly-lunar-cycle.constants";

import type { LunarPhase } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { DistanceEphemeris } from "../ephemeris/ephemeris.types";
import type {
  DetectMonthlyLunarCycleArguments,
  ElongationWindow,
} from "./monthly-lunar-cycle.types";
import type { Moment } from "moment-timezone";

/**
 * Detects the Moon's monthly phases and the spans between them. Phases are timed by elongation from the Sun: the four primary phases at 0°, 90°, 180° and 270°, as USNO times them, and the octants between at 45°, 135°, 225° and 315°.
 */
@Injectable()
export class MonthlyLunarCycleService {
  // 🏗 Dependency Injection

  constructor(
    private readonly calendarService: CalendarService,
    private readonly logger: LoggerService,
    private readonly ephemerisService: EphemerisService,
    private readonly lunarApsidesService: LunarApsidesService,
  ) {
    this.logger.setContext(MonthlyLunarCycleService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Reads the lunar phase from entering event tags; null, with a warning, when
   * the tag is missing or unknown.
   */
  private extractLunarPhaseFromTags(
    tags: string[],
    enteringSummary: string,
  ): LunarPhase | null {
    const capitalizedLunarPhases = new Set(
      lunarPhases.map((phase) => _.startCase(phase)),
    );
    const lunarPhaseCapitalized = tags.find((tag) =>
      capitalizedLunarPhases.has(tag),
    );
    if (!lunarPhaseCapitalized) {
      this.logger.warn(
        "🌙 Skipping progressive event without a lunar phase",
        undefined,
        { enteringSummary, tags },
      );
      return null;
    }
    const lunarPhaseLower = lunarPhaseCapitalized.toLowerCase();
    if (!isLunarPhase(lunarPhaseLower)) {
      this.logger.warn("🌙 Skipping unknown lunar phase", undefined, {
        lunarPhaseLower,
      });
      return null;
    }
    return lunarPhaseLower;
  }

  /**
   * The Moon's elongation from the Sun, in [0, 360), at a minute: its apparent
   * geocentric ecliptic longitude minus the Sun's.
   */
  private getElongation(args: DetectMonthlyLunarCycleArguments): number {
    const { minute, moonCoordinateEphemeris, sunCoordinateEphemeris } = args;
    const timestamp = minute.toISOString();
    const moonLongitude = this.ephemerisService.getCoordinateFromEphemeris(
      moonCoordinateEphemeris,
      timestamp,
      "longitude",
    );
    const sunLongitude = this.ephemerisService.getCoordinateFromEphemeris(
      sunCoordinateEphemeris,
      timestamp,
      "longitude",
    );
    return (((moonLongitude - sunLongitude) % 360) + 360) % 360;
  }

  /** Samples the Moon's elongation at the previous, current and next minute. */
  private getElongationWindow(
    args: DetectMonthlyLunarCycleArguments,
  ): ElongationWindow {
    const { minute } = args;
    return {
      current: this.getElongation(args),
      next: this.getElongation({
        ...args,
        minute: minute.clone().add(1, "minute"),
      }),
      previous: this.getElongation({
        ...args,
        minute: minute.clone().subtract(1, "minute"),
      }),
    };
  }

  /** Detects which phases begin at this minute, by elongation. */
  private getLunarPhases(args: DetectMonthlyLunarCycleArguments): LunarPhase[] {
    const elongations = this.getElongationWindow(args);
    return lunarPhases.filter((lunarPhase) =>
      this.isElongationReached(
        elongations,
        ELONGATION_BY_LUNAR_PHASE[lunarPhase],
      ),
    );
  }

  /**
   * Derives monthly lunar cycle progressive event.
   */
  private getMonthlyLunarCycleProgressiveEvent(
    entering: DetectedCalendarEvent,
    exiting: DetectedCalendarEvent,
  ): DetectedCalendarEvent | null {
    const tags = entering.tags;
    const lunarPhase = this.extractLunarPhaseFromTags(tags, entering.summary);
    if (!lunarPhase) {
      return null;
    }
    const lunarPhaseCapitalized = _.startCase(lunarPhase);
    const lunarPhaseSymbol = symbolByLunarPhase[lunarPhase];
    return {
      description: `${lunarPhaseCapitalized} Moon`,
      end: exiting.start,
      start: entering.start,
      summary: `🌙${lunarPhaseSymbol} ${lunarPhaseCapitalized} Moon`,
      tags: [
        "Astronomy",
        "Astrology",
        "Monthly Lunar Cycle",
        "Lunar",
        lunarPhaseCapitalized,
      ],
    };
  }

  /**
   * Whether the Moon's elongation reaches `target` nearer this minute than
   * either neighbor, so each phase is stamped once.
   */
  private isElongationReached(
    elongations: ElongationWindow,
    target: number,
  ): boolean {
    const offset = (elongation: number): number =>
      ((((elongation - target + 180) % 360) + 360) % 360) - 180;
    const previous = offset(elongations.previous);
    const current = offset(elongations.current);
    const next = offset(elongations.next);
    const reachedSincePrevious =
      previous < 0 && current >= 0 && Math.abs(current) <= Math.abs(previous);
    const reachedBeforeNext =
      current < 0 && next >= 0 && Math.abs(current) < Math.abs(next);
    return reachedSincePrevious || reachedBeforeNext;
  }

  // 🌎 Public Methods

  /**
   * Creates the calendar event for a lunar phase: a Moon-phase symbol, phase
   * name, and capitalized phase tag.
   */
  buildMonthlyLunarCycleEvent(args: {
    date: Moment;
    lunarPhase: LunarPhase;
  }): DetectedCalendarEvent {
    const { date, lunarPhase } = args;

    const lunarPhaseCapitalized = _.startCase(lunarPhase);
    const description = `${lunarPhaseCapitalized} Moon`;
    const summary = `🌙${symbolByLunarPhase[lunarPhase]} ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: [
        "Astronomy",
        "Astrology",
        "Monthly Lunar Cycle",
        "Lunar",
        lunarPhaseCapitalized,
      ],
      timezone: "America/New_York",
    });
  }

  /**
   * Detects the lunar phases beginning at a minute, by elongation: New 0°,
   * First Quarter 90°, Full 180°, Last Quarter 270°.
   */
  detect(args: DetectMonthlyLunarCycleArguments): DetectedCalendarEvent[] {
    const { minute } = args;
    return this.getLunarPhases(args).map((lunarPhase) =>
      this.buildMonthlyLunarCycleEvent({ date: minute, lunarPhase }),
    );
  }

  /**
   * Detects a lunar apogee or perigee at a specific minute.
   *
   * @see {@link LunarApsidesService.detect} for the radial-speed test
   */
  detectApsides(args: {
    minute: Moment;
    moonDistanceEphemeris: DistanceEphemeris;
  }): DetectedCalendarEvent[] {
    return this.lunarApsidesService.detect(args);
  }

  /**
   * Pairs consecutive lunar phase events into progressive spans: the time spent
   * in each phase, roughly 3.7 days on average.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const progressiveEvents: DetectedCalendarEvent[] = [];

    // Filter to monthly lunar cycle events only
    const lunarCycleEvents = events.filter((event) =>
      event.tags.includes("Monthly Lunar Cycle"),
    );

    // Sort by time
    const sortedEvents = _.sortBy(lunarCycleEvents, (event) =>
      event.start.valueOf(),
    );

    // Pair consecutive lunar phases to create progressive events
    for (let index = 0; index < sortedEvents.length - 1; index++) {
      const entering = sortedEvents[index];
      const exiting = sortedEvents[index + 1];
      if (!entering || !exiting) {
        continue;
      }

      const durationEvent = this.getMonthlyLunarCycleProgressiveEvent(
        entering,
        exiting,
      );
      if (!durationEvent) {
        continue;
      }

      progressiveEvents.push(durationEvent);
    }

    return progressiveEvents;
  }
}
