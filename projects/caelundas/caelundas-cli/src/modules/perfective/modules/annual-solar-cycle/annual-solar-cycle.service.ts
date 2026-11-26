import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { ProgressiveUtilitiesService } from "../../../progressive/progressive-utilities.service";

import { AnnualSolarCycleEventsService } from "./annual-solar-cycle-events.service";
import {
  ANNUAL_SOLAR_CYCLE_BASE_TAGS,
  APHELION_TAG,
  PERIHELION_TAG,
  SEASON_BY_SEASON_START,
  SEASONS_IN_ORDER,
  SOLAR_ADVANCING_DESCRIPTION,
  SOLAR_ADVANCING_SUMMARY,
  SOLAR_ADVANCING_TAG,
  SOLAR_INTERVAL_NAMES,
  SOLAR_RETREATING_DESCRIPTION,
  SOLAR_RETREATING_SUMMARY,
  SOLAR_RETREATING_TAG,
  SOLAR_YEAR_POINTS,
} from "./annual-solar-cycle.constants";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { DistanceEphemeris } from "../../../ephemeris/ephemeris.types";
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

  /** Builds the interval from the point at `from` to the next one. */
  private getIntervalEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
    from: number,
  ): DetectedCalendarEvent {
    const name = SOLAR_INTERVAL_NAMES[from] ?? "";
    const next = (from + 1) % SOLAR_YEAR_POINTS.length;
    const named = from % 2 === 0 ? beginning : ending;
    const [symbol = ""] = named.summary.split(" ");

    return {
      description: `${name} (${SOLAR_YEAR_POINTS[from] ?? ""} to ${SOLAR_YEAR_POINTS[next] ?? ""})`,
      end: ending.start,
      start: beginning.start,
      summary: `${symbol} ${name}`,
      tags: [
        ...ANNUAL_SOLAR_CYCLE_BASE_TAGS,
        name,
        SEASONS_IN_ORDER[Math.floor(from / 4)] ?? "",
      ],
    };
  }

  /**
   * Splits each gap between named points of the year at the hexadecan between:
   * Post- the first, Pre- the next.
   */
  private getIntervalProgressiveEvents(
    events: DetectedCalendarEvent[],
  ): DetectedCalendarEvent[] {
    const indexOf = (event: DetectedCalendarEvent): number =>
      SOLAR_YEAR_POINTS.findIndex((name) => event.tags.includes(name));
    const points = _.sortBy(
      events.filter((event) => indexOf(event) !== -1),
      (event) => event.start.valueOf(),
    );

    return points.slice(0, -1).flatMap((beginning, position) => {
      const ending = points[position + 1];
      const from = indexOf(beginning);

      return ending !== undefined &&
        indexOf(ending) === (from + 1) % SOLAR_YEAR_POINTS.length
        ? [this.getIntervalEvent(beginning, ending, from)]
        : [];
    });
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

  /**
   * Chains the equinoxes and solstices into the four seasons: each runs from
   * the point that begins it to the next one.
   */
  private getSeasonProgressiveEvents(
    events: DetectedCalendarEvent[],
  ): DetectedCalendarEvent[] {
    const starts = _.sortBy(
      events.filter((event) =>
        Object.keys(SEASON_BY_SEASON_START).some((name) =>
          event.tags.includes(name),
        ),
      ),
      (event) => event.start.valueOf(),
    );

    return starts.slice(0, -1).flatMap((beginning, index) => {
      const ending = starts[index + 1];
      const season = Object.entries(SEASON_BY_SEASON_START).find(([point]) =>
        beginning.tags.includes(point),
      )?.[1];

      return ending === undefined || season === undefined
        ? []
        : [
            {
              description: season.season,
              end: ending.start,
              start: beginning.start,
              summary: `${season.symbol} ${season.season}`,
              tags: [...ANNUAL_SOLAR_CYCLE_BASE_TAGS, season.season],
            },
          ];
    });
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
   * Pairs apsis events into advancing and retreating spans, and the equinoxes
   * and solstices into the four seasons.
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
      ...this.getSeasonProgressiveEvents(solarApsisEvents),
      ...this.getIntervalProgressiveEvents(solarApsisEvents),
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
