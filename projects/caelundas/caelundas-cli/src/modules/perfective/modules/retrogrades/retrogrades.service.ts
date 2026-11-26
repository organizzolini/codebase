import { Injectable } from "@nestjs/common";
import moment from "moment-timezone";

import { LoggerService } from "@codebase/observability";

import {
  MARGIN_MINUTES,
  retrogradeBodies,
} from "../../../caelundas/caelundas.constants";
import {
  bodyDisplayName,
  capitalize,
} from "../../../caelundas/caelundas.types";
import {
  symbolByBody,
  symbolByOrbitalDirection,
} from "../../../caelundas/symbol-caelundas.constants";
import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";
import { MathService } from "../../../ephemeris/modules/math/math.service";
import { ProgressiveUtilitiesService } from "../../../progressive/progressive-utilities.service";

import {
  STATION_SCAN_PADDING_MINUTES,
  STATION_SEARCH_LIMIT_DAYS,
  STATION_SEARCH_STEP_MINUTES,
} from "./retrogrades.constants";

import type {
  OrbitalDirection,
  RetrogradeBody,
} from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../../../ephemeris/ephemeris.types";
import type { SweepWindow } from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Moment } from "moment-timezone";

/**
 * Detects planetary retrograde and direct station events from minute-by-minute ecliptic longitude series.
 *
 * Identifies stationary points where a planet's apparent motion reverses direction, emitting
 * "Stationary Retrograde" and "Stationary Direct" boundary events as well as progressive duration spans.
 */
@Injectable()
export class RetrogradesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly logger: LoggerService,
    private readonly ephemerisService: EphemerisService,
    private readonly mathService: MathService,
    private readonly progressiveUtilitiesService: ProgressiveUtilitiesService,
  ) {
    this.logger.setContext(RetrogradesService.name);
  }

  // 🔐 Private Fields

  private static readonly tags = ["Astronomy", "Astrology", "Direction"];

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Detects body stations.
   */
  private detectBodyStations(
    body: RetrogradeBody,
    ephemeris: CoordinateEphemeris,
    minute: Moment,
  ): DetectedCalendarEvent[] {
    return this.getStationDirections(ephemeris, minute).map((direction) =>
      this.buildRetrogradeEvent({ body, direction, timestamp: minute }),
    );
  }

  /**
   * The station ending the stay a planet is in at `from`: probed a day at a
   * time, then scanned with the sweep's detection. Where the range ends
   * first, the station is at the range's limit.
   */
  private findStation(args: {
    body: RetrogradeBody;
    edge: Moment;
    from: Moment;
    search: -1 | 1;
  }): undefined | { kind: OrbitalDirection; minute: Moment } {
    const { body, edge, from, search } = args;
    const retrograde = this.isRetrogradeAt(body, from);
    const range = this.boundarySearchService.getLimit(search, edge);
    const reach = from.clone().add(search * STATION_SEARCH_LIMIT_DAYS, "days");
    const limit =
      search === 1 ? moment.min(reach, range) : moment.max(reach, range);
    const bracket = this.boundarySearchService.find({
      direction: search,
      from,
      isInside: (minute) => this.isRetrogradeAt(body, minute) === retrograde,
      limit,
      resolutionMinutes: STATION_SEARCH_STEP_MINUTES,
      stepMinutes: STATION_SEARCH_STEP_MINUTES,
    });
    const kind = (search === -1) === retrograde ? "retrograde" : "direct";

    if (bracket === undefined) {
      return limit.isSame(range) ? { kind, minute: range } : undefined;
    }

    const minute = this.scanForStation({
      body,
      first: moment.min(bracket.inside, bracket.outside),
      kind,
      last: moment.max(bracket.inside, bracket.outside),
    });

    return minute === undefined ? undefined : { kind, minute };
  }

  /**
   * Builds the span a planet moves forward, from a direct station to the next
   * retrograde station.
   */
  private getDirectProgressiveEvent(
    beginningEvent: DetectedCalendarEvent,
    endingEvent: DetectedCalendarEvent,
    planet: RetrogradeBody,
  ): DetectedCalendarEvent {
    const planetCapitalized = bodyDisplayName(planet);

    return {
      description: `${planetCapitalized} Direct`,
      end: endingEvent.start,
      start: beginningEvent.start,
      summary: `${symbolByBody[planet]}${symbolByOrbitalDirection.direct} ${planetCapitalized} Direct`,
      tags: ["Astronomy", "Astrology", "Directs", planetCapitalized],
    };
  }

  /**
   * The stations just outside a window: the one beginning its first stay, the
   * one ending its last.
   */
  private getEdgeStations(
    body: RetrogradeBody,
    window: SweepWindow,
  ): DetectedCalendarEvent[] {
    const stations = [
      this.findStation({
        body,
        edge: window.start,
        from: window.start.clone().subtract(1, "minute"),
        search: -1,
      }),
      this.findStation({
        body,
        edge: window.end,
        from: window.end,
        search: 1,
      }),
    ];

    return stations.flatMap((station) =>
      station === undefined
        ? []
        : [
            this.getStationEvent({
              body,
              direction: station.kind,
              timestamp: station.minute,
            }),
          ],
    );
  }

  /**
   * Derives next longitudes.
   */
  private getNextLongitudes(
    ephemeris: CoordinateEphemeris,
    minute: Moment,
  ): number[] {
    return Array.from({ length: MARGIN_MINUTES }, (_, index) => {
      const date = minute.clone().add(index + 1, "minutes");
      return this.ephemerisService.getCoordinateFromEphemeris(
        ephemeris,
        date.toISOString(),
        "longitude",
      );
    });
  }

  /**
   * Derives previous longitudes.
   */
  private getPreviousLongitudes(
    ephemeris: CoordinateEphemeris,
    minute: Moment,
  ): number[] {
    return Array.from({ length: MARGIN_MINUTES }, (_, index) => {
      const date = minute.clone().subtract(MARGIN_MINUTES - index, "minutes");
      return this.ephemerisService.getCoordinateFromEphemeris(
        ephemeris,
        date.toISOString(),
        "longitude",
      );
    });
  }

  /**
   * Derives retrograde progressive event.
   */
  private getRetrogradeProgressiveEvent(
    beginningEvent: DetectedCalendarEvent,
    endingEvent: DetectedCalendarEvent,
    planet: RetrogradeBody,
  ): DetectedCalendarEvent {
    const start = beginningEvent.start;
    const end = endingEvent.start;

    const planetCapitalized = bodyDisplayName(planet);

    const symbol = symbolByBody[planet];

    return {
      description: `${planetCapitalized} Retrograde`,
      end,
      start,
      summary: `${symbol}↩️ ${planetCapitalized} Retrograde`,
      tags: ["Astronomy", "Astrology", "Retrogrades", planetCapitalized],
    };
  }

  /**
   * The stations a planet makes at a minute: retrograde, direct, or neither.
   */
  private getStationDirections(
    ephemeris: CoordinateEphemeris,
    minute: Moment,
  ): OrbitalDirection[] {
    const currentLongitude = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      minute.toISOString(),
      "longitude",
    );
    const longitudes = {
      currentLongitude,
      nextLongitudes: this.getNextLongitudes(ephemeris, minute),
      previousLongitudes: this.getPreviousLongitudes(ephemeris, minute),
    };

    return [
      ...(this.isRetrograde({ ...longitudes }) ? ["retrograde" as const] : []),
      ...(this.isDirect({ ...longitudes }) ? ["direct" as const] : []),
    ];
  }

  /**
   * Builds a station's event without logging it.
   */
  private getStationEvent(args: {
    body: RetrogradeBody;
    direction: OrbitalDirection;
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const { body, direction, timestamp } = args;
    const bodyCapitalized = bodyDisplayName(body);
    const description = `${bodyCapitalized} Stationary ${capitalize(direction)}`;

    return {
      description,
      end: timestamp,
      start: timestamp,
      summary: `${symbolByBody[body]}${symbolByOrbitalDirection[direction]} ${description}`,
      tags: [
        ...RetrogradesService.tags,
        bodyCapitalized,
        ...(direction === "retrograde" ? ["Retrograde"] : ["Direct"]),
      ],
    };
  }

  /**
   * Determines whether direct.
   */
  private isDirect(args: {
    currentLongitude: number;
    nextLongitudes: number[];
    previousLongitudes: number[];
  }): boolean {
    const { currentLongitude, nextLongitudes, previousLongitudes } = args;

    const hasBeenRetrograde = previousLongitudes.every((previousLongitude) => {
      const previousLongitudeNormalized =
        this.mathService.normalizeForComparison(
          previousLongitude,
          currentLongitude,
        );
      return previousLongitudeNormalized > currentLongitude;
    });

    const willBeDirect = nextLongitudes.every((nextLongitude) => {
      const nextLongitudeNormalized = this.mathService.normalizeForComparison(
        nextLongitude,
        currentLongitude,
      );
      return nextLongitudeNormalized >= currentLongitude;
    });

    return hasBeenRetrograde && willBeDirect;
  }

  /**
   * Determines whether retrograde.
   */
  private isRetrograde(args: {
    currentLongitude: number;
    nextLongitudes: number[];
    previousLongitudes: number[];
  }): boolean {
    const { currentLongitude, nextLongitudes, previousLongitudes } = args;

    const hasBeenDirect = previousLongitudes.every((previousLongitude) => {
      const previousLongitudeNormalized =
        this.mathService.normalizeForComparison(
          previousLongitude,
          currentLongitude,
        );
      return previousLongitudeNormalized < currentLongitude;
    });

    const willBeRetrograde = nextLongitudes.every((nextLongitude) => {
      const nextLongitudeNormalized = this.mathService.normalizeForComparison(
        nextLongitude,
        currentLongitude,
      );
      return nextLongitudeNormalized <= currentLongitude;
    });

    return hasBeenDirect && willBeRetrograde;
  }

  /**
   * Whether a planet moves backward at a minute: its longitude falls over the
   * next minute.
   */
  private isRetrogradeAt(body: RetrogradeBody, minute: Moment): boolean {
    const next = minute.clone().add(1, "minute");
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [body],
      end: next,
      start: minute,
      timezone: "UTC",
    })[body];
    const current = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      minute.toISOString(),
      "longitude",
    );
    const after = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      next.toISOString(),
      "longitude",
    );

    return this.mathService.normalizeForComparison(after, current) < current;
  }

  /**
   * The minute a planet makes a station, scanning the span a probe bracket
   * spans plus some padding.
   */
  private scanForStation(args: {
    body: RetrogradeBody;
    first: Moment;
    kind: OrbitalDirection;
    last: Moment;
  }): Moment | undefined {
    const { body, first, kind, last } = args;
    const start = first
      .clone()
      .subtract(STATION_SCAN_PADDING_MINUTES, "minutes");
    const end = last.clone().add(STATION_SCAN_PADDING_MINUTES, "minutes");
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [body],
      end: end.clone().add(MARGIN_MINUTES, "minutes"),
      start: start.clone().subtract(MARGIN_MINUTES, "minutes"),
      timezone: "UTC",
    })[body];

    for (
      const minute = start.clone();
      !minute.isAfter(end);
      minute.add(1, "minute")
    ) {
      if (this.getStationDirections(ephemeris, minute).includes(kind)) {
        return minute.clone();
      }
    }

    return undefined;
  }

  // 🌎 Public Methods

  /**
   * Creates a calendar event for a retrograde or direct station, tagged by direction.
   */
  buildRetrogradeEvent(args: {
    body: RetrogradeBody;
    direction: OrbitalDirection;
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const retrogradeEvent = this.getStationEvent(args);

    this.logger.info("🗓️ Built a calendar event", undefined, {
      at: args.timestamp.toISOString(),
      summary: retrogradeEvent.summary,
    });

    return retrogradeEvent;
  }

  /**
   * Detects retrograde and direct station events at a time point from ecliptic longitude turning points.
   * @see {@link retrogradeBodies} for the bodies checked
   */
  detect(args: {
    coordinateEphemerisByBody: Record<RetrogradeBody, CoordinateEphemeris>;
    minute: Moment;
  }): DetectedCalendarEvent[] {
    const { coordinateEphemerisByBody, minute } = args;
    const retrogradeEvents: DetectedCalendarEvent[] = [];
    for (const body of retrogradeBodies) {
      const ephemeris = coordinateEphemerisByBody[body];
      retrogradeEvents.push(
        ...this.detectBodyStations(body, ephemeris, minute),
      );
    }
    return retrogradeEvents;
  }

  /**
   * Pairs a planet's stations into retrograde and direct periods; with the
   * sweep window, edge stations complete the cut-off ones.
   */
  detectProgressive(
    events: DetectedCalendarEvent[],
    window?: SweepWindow,
  ): DetectedCalendarEvent[] {
    const stations = events.filter((event) => event.tags.includes("Direction"));

    return retrogradeBodies.flatMap((planet) => {
      const planetCapitalized = bodyDisplayName(planet);
      const planetStations = [
        ...stations,
        ...(window === undefined ? [] : this.getEdgeStations(planet, window)),
      ];
      const retrogrades = planetStations.filter(
        (event) =>
          event.description === `${planetCapitalized} Stationary Retrograde`,
      );
      const directs = planetStations.filter(
        (event) =>
          event.description === `${planetCapitalized} Stationary Direct`,
      );

      return [
        ...this.progressiveUtilitiesService
          .pairProgressiveEvents(retrogrades, directs, `${planet} retrograde`)
          .map(([beginning, ending]) =>
            this.getRetrogradeProgressiveEvent(beginning, ending, planet),
          ),
        ...this.progressiveUtilitiesService
          .pairProgressiveEvents(directs, retrogrades, `${planet} direct`)
          .map(([beginning, ending]) =>
            this.getDirectProgressiveEvent(beginning, ending, planet),
          ),
      ];
    });
  }
}
