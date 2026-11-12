import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  MARGIN_MINUTES,
  retrogradeBodies,
} from "../caelundas/caelundas.constants";
import { bodyDisplayName, capitalize } from "../caelundas/caelundas.types";
import {
  symbolByBody,
  symbolByOrbitalDirection,
} from "../caelundas/symbol-caelundas.constants";
import { EphemerisService } from "../ephemeris/ephemeris.service";
import { MathService } from "../math/math.service";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import type {
  OrbitalDirection,
  RetrogradeBody,
} from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
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
    const events: DetectedCalendarEvent[] = [];
    const currentLongitude = this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      minute.toISOString(),
      "longitude",
    );
    const previousLongitudes = this.getPreviousLongitudes(ephemeris, minute);
    const nextLongitudes = this.getNextLongitudes(ephemeris, minute);
    const longitudes = { currentLongitude, nextLongitudes, previousLongitudes };
    if (this.isRetrograde({ ...longitudes })) {
      events.push(
        this.buildRetrogradeEvent({
          body,
          direction: "retrograde",
          timestamp: minute,
        }),
      );
    }
    if (this.isDirect({ ...longitudes })) {
      events.push(
        this.buildRetrogradeEvent({
          body,
          direction: "direct",
          timestamp: minute,
        }),
      );
    }
    return events;
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

  // 🌎 Public Methods

  /**
   * Creates a calendar event for a retrograde or direct station, tagged by direction.
   */
  buildRetrogradeEvent(args: {
    body: RetrogradeBody;
    direction: OrbitalDirection;
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const { body, direction, timestamp } = args;

    const bodyCapitalized = bodyDisplayName(body);
    const orbitalDirectionCapitalized = capitalize(direction);

    const retrogradeBodySymbol = symbolByBody[body];
    const orbitalDirectionSymbol = symbolByOrbitalDirection[direction];

    const description = `${bodyCapitalized} Stationary ${orbitalDirectionCapitalized}`;
    const summary = `${retrogradeBodySymbol}${orbitalDirectionSymbol} ${description}`;

    this.logger.info("🗓️ Built a calendar event", undefined, {
      at: timestamp.toISOString(),
      summary,
    });

    const retrogradeEvent: DetectedCalendarEvent = {
      description,
      end: timestamp,
      start: timestamp,
      summary,
      tags: [
        ...RetrogradesService.tags,
        bodyCapitalized,
        ...(direction === "retrograde" ? ["Retrograde"] : ["Direct"]),
      ],
    };

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
   * Pairs retrograde and direct stations per planet into progressive events spanning each retrograde period.
   * @see {@link pairProgressiveEvents} for the pairing algorithm
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const progressiveEvents: DetectedCalendarEvent[] = [];

    const retrogradeEvents = events.filter((event) =>
      event.tags.includes("Direction"),
    );

    // Process each planet separately
    for (const planet of retrogradeBodies) {
      const planetCapitalized = bodyDisplayName(planet);
      const beginnings = retrogradeEvents.filter(
        (event) =>
          event.description === `${planetCapitalized} Stationary Retrograde`,
      );
      const endings = retrogradeEvents.filter(
        (event) =>
          event.description === `${planetCapitalized} Stationary Direct`,
      );

      const pairs = this.progressiveUtilitiesService.pairProgressiveEvents(
        beginnings,
        endings,
        `${planet} retrograde`,
      );

      progressiveEvents.push(
        ...pairs.map(([beginning, ending]) =>
          this.getRetrogradeProgressiveEvent(beginning, ending, planet),
        ),
      );
    }

    return progressiveEvents;
  }
}
