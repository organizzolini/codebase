import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { AnnualSolarCycleService } from "../annual-solar-cycle/annual-solar-cycle.service";
import { AspectsService } from "../aspects/aspects.service";
import { MARGIN_MINUTES } from "../caelundas/caelundas.constants";
import { DailyCyclesService } from "../daily-cycles/daily-cycles.service";
import { DatetimeService } from "../datetime/datetime.service";
import { EclipsesService } from "../eclipses/eclipses.service";
import { EphemerisService } from "../ephemeris/ephemeris.service";
import { IngressesService } from "../ingresses/ingresses.service";
import { MonthlyLunarCycleService } from "../monthly-lunar-cycle/monthly-lunar-cycle.service";
import { PhasesService } from "../phases/phases.service";
import { RetrogradesService } from "../retrogrades/retrogrades.service";
import { TwilightsService } from "../twilights/twilights.service";

import { detectorFamilies } from "./perfective.constants";

import type { AspectBodies } from "../aspects/aspects.types";
import type { DetectedCalendarEvent } from "../caelundas-database/caelundas-database.types";
import type { Coordinates, Ephemerides } from "../ephemeris/ephemeris.types";
import type { Input } from "../input/input.types";
import type { DetectorFamily, PerfectiveOptions } from "./perfective.types";
import type { Moment } from "moment-timezone";

/**
 * Orchestrates minute-by-minute detection of all astronomical events for a date range.
 *
 * Computes ephemerides day-by-day and delegates to specialized services to identify
 * aspects, eclipses, retrogrades, ingresses, daily cycles, lunar phases,
 * annual solar cycle events, and twilight transitions.
 */
@Injectable()
export class PerfectiveService {
  // 🏗 Dependency Injection

  constructor(
    private readonly datetimeService: DatetimeService,
    private readonly ephemerisService: EphemerisService,
    private readonly aspectsService: AspectsService,
    private readonly eclipsesService: EclipsesService,
    private readonly retrogradesService: RetrogradesService,
    private readonly ingressesService: IngressesService,
    private readonly dailyCyclesService: DailyCyclesService,
    private readonly monthlyLunarCycleService: MonthlyLunarCycleService,
    private readonly annualSolarCycleService: AnnualSolarCycleService,
    private readonly twilightsService: TwilightsService,
    private readonly phasesService: PhasesService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PerfectiveService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Sweeps one day minute-by-minute, aggregating perfective events and rolling aspect state forward. */
  private detectDayEvents(args: {
    coordinates: Coordinates;
    date: Moment;
    families: ReadonlySet<DetectorFamily>;
    /** Undefined on the sweep's first day, which seeds the registry instead. */
    previousAspectBodies: AspectBodies[] | undefined;
    timezone: string;
  }): {
    events: DetectedCalendarEvent[];
    previousAspectBodies: AspectBodies[];
  } {
    const { coordinates, date, families, timezone } = args;
    const startOfDay = date.clone().startOf("day");
    const endOfDay = date.clone().endOf("day");
    const ephemerides = this.ephemerisService.getEphemerides({
      coordinates,
      end: endOfDay.clone().add(MARGIN_MINUTES, "minutes"),
      start: startOfDay.clone().subtract(MARGIN_MINUTES, "minutes"),
      timezone,
    });
    const events: DetectedCalendarEvent[] = [];
    let previousAspectBodies = args.previousAspectBodies ?? [];
    if (families.has("aspects") && args.previousAspectBodies === undefined) {
      const seeded = this.aspectsService.seed({
        coordinateEphemerisByBody: ephemerides.coordinateEphemerisByBody,
        minute: startOfDay,
      });
      previousAspectBodies = seeded.aspectBodies;
      events.push(...seeded.events);
    }
    for (const minute of this.datetimeService.generateMinutes(
      startOfDay,
      endOfDay,
    )) {
      const result = this.detectMinuteEvents({
        ephemerides,
        families,
        minute,
        previousAspectBodies,
      });
      previousAspectBodies = result.aspectBodies;
      events.push(...result.events);
    }
    return { events, previousAspectBodies };
  }

  /** Detects all minute-level event families and returns both events and updated aspect-body state. */
  private detectMinuteEvents(args: {
    ephemerides: Ephemerides;
    families: ReadonlySet<DetectorFamily>;
    minute: Moment;
    previousAspectBodies: AspectBodies[];
  }): { aspectBodies: AspectBodies[]; events: DetectedCalendarEvent[] } {
    const { ephemerides, families, minute, previousAspectBodies } = args;
    const { aspectBodies, events: aspectEvents } = families.has("aspects")
      ? this.aspectsService.detect({
          coordinateEphemerisByBody: ephemerides.coordinateEphemerisByBody,
          minute,
          previousAspectBodies,
        })
      : { aspectBodies: previousAspectBodies, events: [] };
    const events: DetectedCalendarEvent[] = [
      ...aspectEvents,
      ...this.detectObservationalEvents(minute, ephemerides, families),
      ...this.detectOrbitalEvents(minute, ephemerides, families),
    ];
    return { aspectBodies, events };
  }

  /** Detects local observational phenomena such as eclipses, crossings, twilights, and rises/sets. */
  private detectObservationalEvents(
    minute: Moment,
    ephemerides: Ephemerides,
    families: ReadonlySet<DetectorFamily>,
  ): DetectedCalendarEvent[] {
    const {
      azimuthElevationEphemerisByBody,
      coordinateEphemerisByBody,
      distanceEphemerisByBody,
    } = ephemerides;
    return [
      ...(families.has("eclipses")
        ? this.eclipsesService.detect({
            minute,
            moonAzimuthElevationEphemeris: azimuthElevationEphemerisByBody.moon,
            moonCoordinateEphemeris: coordinateEphemerisByBody.moon,
            moonDistanceEphemeris: distanceEphemerisByBody.moon,
            sunAzimuthElevationEphemeris: azimuthElevationEphemerisByBody.sun,
            sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
            sunDistanceEphemeris: distanceEphemerisByBody.sun,
          })
        : []),
      ...(families.has("dailyCycles")
        ? this.dailyCyclesService.detect({
            minute,
            moonAzimuthElevationEphemeris: azimuthElevationEphemerisByBody.moon,
            sunAzimuthElevationEphemeris: azimuthElevationEphemerisByBody.sun,
          })
        : []),
      ...(families.has("twilights")
        ? this.twilightsService.detect({
            minute,
            sunAzimuthElevationEphemeris: azimuthElevationEphemerisByBody.sun,
          })
        : []),
    ];
  }

  /** Detects orbital-state events such as retrogrades, ingresses, lunar phases, and annual markers. */
  private detectOrbitalEvents(
    minute: Moment,
    ephemerides: Ephemerides,
    families: ReadonlySet<DetectorFamily>,
  ): DetectedCalendarEvent[] {
    const {
      coordinateEphemerisByBody,
      distanceEphemerisByBody,
      illuminationEphemerisByBody,
    } = ephemerides;
    return [
      ...(families.has("retrogrades")
        ? this.retrogradesService.detect({ coordinateEphemerisByBody, minute })
        : []),
      ...(families.has("ingresses")
        ? this.ingressesService.detect({ coordinateEphemerisByBody, minute })
        : []),
      ...(families.has("lunarCycle")
        ? [
            ...this.monthlyLunarCycleService.detect({
              minute,
              moonCoordinateEphemeris: coordinateEphemerisByBody.moon,
              sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
            }),
            ...this.monthlyLunarCycleService.detectApsides({
              minute,
              moonDistanceEphemeris: distanceEphemerisByBody.moon,
            }),
          ]
        : []),
      ...(families.has("solarCycle")
        ? this.annualSolarCycleService.detect({
            minute,
            sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
            sunDistanceEphemeris: distanceEphemerisByBody.sun,
          })
        : []),
      ...(families.has("phases")
        ? [
            ...this.phasesService.getMartianPhaseEvents({
              marsCoordinateEphemeris: coordinateEphemerisByBody.mars,
              marsIlluminationEphemeris: illuminationEphemerisByBody.mars,
              minute,
              sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
            }),
            ...this.phasesService.getMercurianPhaseEvents({
              mercuryCoordinateEphemeris: coordinateEphemerisByBody.mercury,
              mercuryIlluminationEphemeris: illuminationEphemerisByBody.mercury,
              minute,
              sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
            }),
            ...this.phasesService.getVenusianPhaseEvents({
              minute,
              sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
              venusCoordinateEphemeris: coordinateEphemerisByBody.venus,
              venusIlluminationEphemeris: illuminationEphemerisByBody.venus,
            }),
          ]
        : []),
    ];
  }

  // 🌎 Public Methods

  /**
   * Detects all perfective (instantaneous) astronomical events within the given date range.
   *
   * Iterates day-by-day, computes per-day ephemerides, then scans minute-by-minute
   * to identify aspects, eclipses, retrogrades, ingresses, daily solar/lunar cycle events,
   * monthly lunar phases, annual solar cycle events, and twilight transitions.
   *
   * A caller that checks one kind of event can name just those detector
   * families in `options.families`; the rest are skipped.
   */
  detect(
    input: Input,
    options: PerfectiveOptions = {},
  ): DetectedCalendarEvent[] {
    const { families = new Set(detectorFamilies) } = options;
    const { end, latitude, longitude, start, timezone } = input;
    const coordinates: Coordinates = [longitude, latitude];
    let previousAspectBodies: AspectBodies[] | undefined;
    const perfectiveEvents: DetectedCalendarEvent[] = [];
    for (const date of this.datetimeService.generateDates(
      start,
      end,
      timezone,
    )) {
      const result = this.detectDayEvents({
        coordinates,
        date,
        families,
        previousAspectBodies,
        timezone,
      });
      previousAspectBodies = result.previousAspectBodies;
      perfectiveEvents.push(...result.events);
    }
    this.logger.info("🔭 Finished a perfective sweep", undefined, {
      events: perfectiveEvents.length,
    });
    return perfectiveEvents;
  }
}
