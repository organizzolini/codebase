import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { MartianPhaseService } from "./martian-phase.service";
import { MercurianPhaseService } from "./mercurian-phase.service";
import {
  MARTIAN_TAG,
  MERCURIAN_TAG,
  PLANETARY_PHASE_TAG,
  VENUSIAN_TAG,
} from "./phases.constants";
import { VenusianPhaseService } from "./venusian-phase.service";

import type { DetectedCalendarEvent } from "../database/database.types";
import type {
  DetectPlanetaryEventsArguments,
  MartianPhaseEventArguments,
  MercurianPhaseEventArguments,
  VenusianPhaseEventArguments,
} from "./phases.types";

/**
 * Orchestrates planetary phase event detection across Venus, Mercury, and Mars.
 */
@Injectable()
export class PhasesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly venusianPhaseService: VenusianPhaseService,
    private readonly mercurianPhaseService: MercurianPhaseService,
    private readonly martianPhaseService: MartianPhaseService,
  ) {
    this.logger.setContext(PhasesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Detects all planetary phase events for a given minute.
   * Combines detection from all three planets (Venus, Mercury, Mars).
   * @deprecated Use {@link getMartianPhaseEvents}, {@link getMercurianPhaseEvents}, or {@link getVenusianPhaseEvents} directly
   */
  detect(args: DetectPlanetaryEventsArguments): DetectedCalendarEvent[] {
    const { coordinateEphemerisByBody, illuminationEphemerisByBody, minute } =
      args;

    const events: DetectedCalendarEvent[] = [
      ...this.getMartianPhaseEvents({
        marsCoordinateEphemeris: coordinateEphemerisByBody.mars,
        marsIlluminationEphemeris: illuminationEphemerisByBody.mars,
        minute,
        sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
      }),
      ...this.getMercurianPhaseEvents({
        mercuryCoordinateEphemeris: coordinateEphemerisByBody.mercury,
        mercuryIlluminationEphemeris: illuminationEphemerisByBody.mercury,
        minute,
        sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
      }),
      ...this.getVenusianPhaseEvents({
        minute,
        sunCoordinateEphemeris: coordinateEphemerisByBody.sun,
        venusCoordinateEphemeris: coordinateEphemerisByBody.venus,
        venusIlluminationEphemeris: illuminationEphemerisByBody.venus,
      }),
    ];

    this.logger.debug("🔍 Detected planetary phase events", undefined, {
      count: events.length,
    });

    return events;
  }

  /**
   * Converts instantaneous planetary phase events into progressive events.
   *
   * Creates visibility period events by pairing:
   * - Morning Rise → Morning Set (morning star period)
   * - Evening Rise → Evening Set (evening star period).
   *
   * Progressive events span the entire time a planet is visible as a morning
   * or evening star, useful for planning observations or understanding
   * astrological timing.
   *
   * @see {@link pairProgressiveEvents} for rise/set pairing logic
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const progressiveEvents: DetectedCalendarEvent[] = [];

    // Filter to planetary phase events
    const planetaryPhaseEvents = events.filter((event) =>
      event.tags.includes(PLANETARY_PHASE_TAG),
    );

    // Process Venus phases
    const venusianPhaseEvents = planetaryPhaseEvents.filter((event) =>
      event.tags.includes(VENUSIAN_TAG),
    );
    progressiveEvents.push(
      ...this.venusianPhaseService.getVenusianPhaseProgressiveEvents(
        venusianPhaseEvents,
      ),
    );

    // Process Mercury phases
    const mercurianPhaseEvents = planetaryPhaseEvents.filter((event) =>
      event.tags.includes(MERCURIAN_TAG),
    );
    progressiveEvents.push(
      ...this.mercurianPhaseService.getMercurianPhaseProgressiveEvents(
        mercurianPhaseEvents,
      ),
    );

    // Process Mars phases
    const martianPhaseEvents = planetaryPhaseEvents.filter((event) =>
      event.tags.includes(MARTIAN_TAG),
    );
    progressiveEvents.push(
      ...this.martianPhaseService.getMartianPhaseProgressiveEvents(
        martianPhaseEvents,
      ),
    );

    this.logger.debug(
      "🔍 Detected progressive planetary phase events",
      undefined,
      { count: progressiveEvents.length },
    );

    return progressiveEvents;
  }

  /**
   * Produces Martian phase events for one minute using precomputed phase parameters.
   */
  getMartianPhaseEvents(
    args: MartianPhaseEventArguments,
  ): DetectedCalendarEvent[] {
    return this.martianPhaseService.getMartianPhaseEvents(args);
  }

  /**
   * Produces Mercurian morning/evening phase events for one minute.
   */
  getMercurianPhaseEvents(
    args: MercurianPhaseEventArguments,
  ): DetectedCalendarEvent[] {
    return this.mercurianPhaseService.getMercurianPhaseEvents(args);
  }

  /**
   * Produces Venusian morning/evening phase events for one minute.
   */
  getVenusianPhaseEvents(
    args: VenusianPhaseEventArguments,
  ): DetectedCalendarEvent[] {
    return this.venusianPhaseService.getVenusianPhaseEvents(args);
  }
}
