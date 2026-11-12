import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { CalendarService } from "../calendar/calendar.service";
import { HORIZON_REFRACTION_DEGREES } from "../ephemeris/ephemeris.constants";
import { EphemerisService } from "../ephemeris/ephemeris.service";
import { MathService } from "../math/math.service";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type {
  AzimuthElevationEphemeris,
  AzimuthElevationEphemerisBody,
} from "../ephemeris/ephemeris.types";
import type { Moment } from "moment-timezone";

/** Event building and elevation detection helpers for {@link DailyCyclesService}. */
@Injectable()
export class DailyCyclesBuilderService {
  // 🏗 Dependency Injection

  constructor(
    private readonly calendarService: CalendarService,
    private readonly logger: LoggerService,
    private readonly ephemerisService: EphemerisService,
  ) {
    this.logger.setContext(DailyCyclesBuilderService.name);
  }

  // 🔐 Private Fields

  private static readonly lunarTags = [
    "Astronomy",
    "Astrology",
    "Daily Lunar Cycle",
    "Lunar",
  ];
  private static readonly solarTags = [
    "Astronomy",
    "Astrology",
    "Daily Solar Cycle",
    "Solar",
  ];
  /**
   * Conventional Sun semidiameter, 16′; with refraction, gives −0.8333° at sunrise.
   */
  private static readonly sunSemidiameterDegrees =
    16 / MathService.arcminutesPerDegree;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Whether an upward zero crossing rounds to this minute: a crossing belongs to
   * its nearer minute, so each lands on one minute.
   */
  private static crossesUpwardNearCurrent(args: {
    current: number;
    next: number;
    previous: number;
  }): boolean {
    const { current, next, previous } = args;
    if (previous < 0 && current >= 0) {
      return previous / (previous - current) >= 0.5;
    }
    if (current < 0 && next >= 0) {
      return current / (current - next) < 0.5;
    }
    return false;
  }

  // 🌎 Public Methods

  /**
   * Creates the lunar nadir event at the Moon's lowest point below the horizon
   * (anti-culmination).
   */
  buildLunarNadirEvent(date: Moment): DetectedCalendarEvent {
    const description = "Lunar Nadir";
    const summary = `🌙⏬ ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.lunarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the lunar zenith event, the Moon's highest point above the horizon
   * (meridian transit).
   */
  buildLunarZenithEvent(date: Moment): DetectedCalendarEvent {
    const description = "Lunar Zenith";
    const summary = `🌙⏫ ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.lunarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the moonrise event, when the Moon's upper limb appears above the
   * horizon, allowing for its ~16 arcminute radius.
   */
  buildMoonriseEvent(date: Moment): DetectedCalendarEvent {
    const description = "Moonrise";
    const summary = `🌙🔼 ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.lunarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the moonset event, when the Moon's upper limb dips below the
   * horizon, allowing for its radius.
   */
  buildMoonsetEvent(date: Moment): DetectedCalendarEvent {
    const description = "Moonset";
    const summary = `🌙🔽 ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.lunarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the solar nadir event: solar midnight, the Sun's lowest point below
   * the horizon.
   */
  buildSolarNadirEvent(date: Moment): DetectedCalendarEvent {
    const description = "Solar Nadir";
    const summary = `☀️⏬ ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.solarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the solar zenith event: solar noon, the Sun's highest point in the
   * sky.
   */
  buildSolarZenithEvent(date: Moment): DetectedCalendarEvent {
    const description = "Solar Zenith";
    const summary = `☀️⏫ ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.solarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the sunrise event, when the Sun's center crosses the geometric
   * horizon upward (no refraction).
   */
  buildSunriseEvent(date: Moment): DetectedCalendarEvent {
    const description = "Sunrise";
    const summary = `☀️🔼 ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.solarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Creates the sunset event, when the Sun's center crosses the geometric
   * horizon downward (no refraction).
   */
  buildSunsetEvent(date: Moment): DetectedCalendarEvent {
    const description = "Sunset";
    const summary = `☀️🔽 ${description}`;

    return this.calendarService.buildInstantEvent({
      date,
      description,
      logger: this.logger,
      summary,
      tags: DailyCyclesBuilderService.solarTags,
      timezone: "America/New_York",
    });
  }

  /**
   * Reads elevation (degrees) for one timestamp from azimuth/elevation ephemeris.
   */
  getElevationAt(
    ephemeris: AzimuthElevationEphemeris,
    timestamp: Moment,
  ): number {
    return this.ephemerisService.getAzimuthElevationFromEphemeris(
      ephemeris,
      timestamp.toISOString(),
      "elevation",
    );
  }

  /**
   * Returns previous/current/next-minute elevation values used by extrema crossing logic.
   */
  getElevationWindow(args: {
    ephemeris: AzimuthElevationEphemeris;
    minute: Moment;
  }): {
    current: number;
    next: number;
    previous: number;
  } {
    const { ephemeris, minute } = args;
    const previous = this.getElevationAt(
      ephemeris,
      minute.clone().subtract(1, "minute"),
    );
    const current = this.getElevationAt(ephemeris, minute);
    const next = this.getElevationAt(
      ephemeris,
      minute.clone().add(1, "minute"),
    );
    return { current, next, previous };
  }

  /**
   * Upper-limb elevation above the horizon at the previous, current and next
   * minute; zero marks rise or set.
   */
  getHorizonClearanceWindow(args: {
    body: AzimuthElevationEphemerisBody;
    ephemeris: AzimuthElevationEphemeris;
    minute: Moment;
  }): { current: number; next: number; previous: number } {
    const { body, ephemeris, minute } = args;
    const clearanceAt = (timestamp: Moment): number => {
      const isoTimestamp = timestamp.toISOString();
      const trueElevation =
        this.ephemerisService.getAzimuthElevationFromEphemeris(
          ephemeris,
          isoTimestamp,
          "trueElevation",
        );
      const semidiameter =
        body === "sun"
          ? DailyCyclesBuilderService.sunSemidiameterDegrees
          : this.ephemerisService.getAzimuthElevationFromEphemeris(
              ephemeris,
              isoTimestamp,
              "semidiameter",
            );
      return trueElevation + HORIZON_REFRACTION_DEGREES + semidiameter;
    };
    return {
      current: clearanceAt(minute),
      next: clearanceAt(minute.clone().add(1, "minute")),
      previous: clearanceAt(minute.clone().subtract(1, "minute")),
    };
  }

  /**
   * Detects a rise at this minute: the upper limb's clearance crosses zero
   * upward, and the crossing rounds to this minute rather than a neighbor.
   */
  isRise(args: { current: number; next: number; previous: number }): boolean {
    return DailyCyclesBuilderService.crossesUpwardNearCurrent(args);
  }

  /**
   * Detects a set at this minute: the upper limb's clearance crosses zero
   * downward, and the crossing rounds to this minute rather than a neighbor.
   */
  isSet(args: { current: number; next: number; previous: number }): boolean {
    const { current, next, previous } = args;
    return DailyCyclesBuilderService.crossesUpwardNearCurrent({
      current: -current,
      next: -next,
      previous: -previous,
    });
  }
}
