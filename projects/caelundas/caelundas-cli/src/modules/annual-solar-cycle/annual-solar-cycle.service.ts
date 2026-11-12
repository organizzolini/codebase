import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../ephemeris/ephemeris.service";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { AnnualSolarCycleEventsService } from "./annual-solar-cycle-events.service";
import {
  ANNUAL_SOLAR_CYCLE_BASE_TAGS,
  APHELION_TAG,
  PERIHELION_TAG,
  SOLAR_ADVANCING_DESCRIPTION,
  SOLAR_ADVANCING_SUMMARY,
  SOLAR_ADVANCING_TAG,
  SOLAR_RETREATING_DESCRIPTION,
  SOLAR_RETREATING_SUMMARY,
  SOLAR_RETREATING_TAG,
} from "./annual-solar-cycle.constants";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { DistanceEphemeris } from "../ephemeris/ephemeris.types";
import type {
  DetectAnnualSolarCycleArguments,
  DetectAnnualSolarCycleEventsArguments,
  DetectSolarApsisEventsArguments,
  SolarCycleLongitudes,
  SolarDistanceSample,
} from "./annual-solar-cycle.types";
import type { Moment } from "moment-timezone";

/**
 * Detects key annual solar cycle events based on the Sun's ecliptic longitude and distance.
 *
 * Identifies solstices, equinoxes, Celtic cross-quarter days, hexadecans (16-part ecliptic
 * divisions), and solar apsis events (perihelion and aphelion).
 */
@Injectable()
export class AnnualSolarCycleService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly ephemerisService: EphemerisService,
    private readonly progressiveUtilitiesService: ProgressiveUtilitiesService,
    private readonly annualSolarCycleEventsService: AnnualSolarCycleEventsService,
  ) {
    this.logger.setContext(AnnualSolarCycleService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Pairs aphelion-to-perihelion markers into Solar Advancing duration events. */
  private getAdvancingProgressiveEvents(
    aphelionEvents: DetectedCalendarEvent[],
    perihelionEvents: DetectedCalendarEvent[],
  ): DetectedCalendarEvent[] {
    const advancingPairs =
      this.progressiveUtilitiesService.pairProgressiveEvents(
        aphelionEvents,
        perihelionEvents,
        SOLAR_ADVANCING_DESCRIPTION,
      );
    return advancingPairs.map(([beginning, ending]) =>
      this.getSolarAdvancingDurationEvent(beginning, ending),
    );
  }

  /**
   * The minute whose radial speed is nearer zero, where the apsis is stamped;
   * ties go later.
   */
  private getNearestApsisMinute(
    minute: Moment,
    speeds: SolarDistanceSample,
  ): Moment {
    return Math.abs(speeds.previous) < Math.abs(speeds.current)
      ? minute.clone().subtract(1, "minute")
      : minute;
  }

  /** Pairs perihelion-to-aphelion markers into Solar Retreating duration events. */
  private getRetreatingProgressiveEvents(
    perihelionEvents: DetectedCalendarEvent[],
    aphelionEvents: DetectedCalendarEvent[],
  ): DetectedCalendarEvent[] {
    const retreatingPairs =
      this.progressiveUtilitiesService.pairProgressiveEvents(
        perihelionEvents,
        aphelionEvents,
        SOLAR_RETREATING_DESCRIPTION,
      );
    return retreatingPairs.map(([beginning, ending]) =>
      this.getSolarRetreatingDurationEvent(beginning, ending),
    );
  }

  /** Builds the progressive span event for Earth moving from aphelion toward perihelion. */
  private getSolarAdvancingDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: SOLAR_ADVANCING_DESCRIPTION,
      end: ending.start,
      start: beginning.start,
      summary: SOLAR_ADVANCING_SUMMARY,
      tags: [...ANNUAL_SOLAR_CYCLE_BASE_TAGS, SOLAR_ADVANCING_TAG],
    };
  }

  /** Samples the Sun's radial speed at the minute and the minute before it. */
  private getSolarDistanceSpeeds(
    minute: Moment,
    sunDistanceEphemeris: DistanceEphemeris,
  ): SolarDistanceSample {
    const previousMinute = minute.clone().subtract(1, "minute");
    return {
      current: this.ephemerisService.getDistanceSpeedFromEphemeris(
        sunDistanceEphemeris,
        minute.toISOString(),
      ),
      previous: this.ephemerisService.getDistanceSpeedFromEphemeris(
        sunDistanceEphemeris,
        previousMinute.toISOString(),
      ),
    };
  }

  /** Builds the progressive span event for Earth moving from perihelion toward aphelion. */
  private getSolarRetreatingDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: SOLAR_RETREATING_DESCRIPTION,
      end: ending.start,
      start: beginning.start,
      summary: SOLAR_RETREATING_SUMMARY,
      tags: [...ANNUAL_SOLAR_CYCLE_BASE_TAGS, SOLAR_RETREATING_TAG],
    };
  }

  // 🌎 Public Methods

  /**
   * Detects annual solar cycle and apsis events at a minute. Solar longitude
   * markers: 0° equinox, 90° solstice, 180° equinox, 270° solstice.
   */
  detect(args: DetectAnnualSolarCycleArguments): DetectedCalendarEvent[] {
    return [
      ...this.getAnnualSolarCycleEvents(args),
      ...this.getSolarApsisEvents(args),
    ];
  }

  /**
   * Pairs apsis events into progressive spans: advancing from aphelion to
   * perihelion, retreating back. Earth moves fastest at perihelion.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const solarApsisEvents = events.filter((event) =>
      event.tags.includes("Annual Solar Cycle"),
    );
    const perihelionEvents = solarApsisEvents.filter((event) =>
      event.tags.includes(PERIHELION_TAG),
    );
    const aphelionEvents = solarApsisEvents.filter((event) =>
      event.tags.includes(APHELION_TAG),
    );
    return [
      ...this.getAdvancingProgressiveEvents(aphelionEvents, perihelionEvents),
      ...this.getRetreatingProgressiveEvents(perihelionEvents, aphelionEvents),
    ];
  }

  /**
   * Detects solstice, equinox, cross-quarter, and hexadecan events at a minute by
   * comparing the Sun's ecliptic longitude against each marker.
   */
  getAnnualSolarCycleEvents(
    args: DetectAnnualSolarCycleEventsArguments,
  ): DetectedCalendarEvent[] {
    const { minute, sunCoordinateEphemeris: ephemeris } = args;
    const previousMinute = minute.clone().subtract(1, "minute");
    const currentLongitude = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      minute.toISOString(),
      "longitude",
    );
    const previousLongitude = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      previousMinute.toISOString(),
      "longitude",
    );
    const longitudes: SolarCycleLongitudes = {
      currentLongitude,
      previousLongitude,
    };
    return [
      ...this.annualSolarCycleEventsService.getVernalToAutumnalEvents(
        longitudes,
        minute,
      ),
      ...this.annualSolarCycleEventsService.getAutumnalToVernalEvents(
        longitudes,
        minute,
      ),
    ];
  }

  /**
   * Detects perihelion and aphelion as sign changes in the Sun's radial speed;
   * distance has steps that fake extrema.
   */
  getSolarApsisEvents(
    args: DetectSolarApsisEventsArguments,
  ): DetectedCalendarEvent[] {
    const { minute, sunDistanceEphemeris } = args;
    const speeds = this.getSolarDistanceSpeeds(minute, sunDistanceEphemeris);
    const apsisMinute = this.getNearestApsisMinute(minute, speeds);
    const solarApsisEvents: DetectedCalendarEvent[] = [];
    // Receding (positive speed) turning to approaching: farthest point.
    if (speeds.previous > 0 && speeds.current <= 0) {
      solarApsisEvents.push(
        this.annualSolarCycleEventsService.buildAphelionEvent(apsisMinute),
      );
    }
    // Approaching (negative speed) turning to receding: nearest point.
    if (speeds.previous < 0 && speeds.current >= 0) {
      solarApsisEvents.push(
        this.annualSolarCycleEventsService.buildPerihelionEvent(apsisMinute),
      );
    }
    return solarApsisEvents;
  }
}
