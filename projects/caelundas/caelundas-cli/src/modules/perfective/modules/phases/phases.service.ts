import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ElongationSpansService } from "./modules/elongation/elongation-spans.service";
import { MartianPhaseService } from "./modules/martian/martian-phase.service";
import { MercurianPhaseService } from "./modules/mercurian/mercurian-phase.service";
import { VenusianPhaseService } from "./modules/venusian/venusian-phase.service";
import {
  MERCURIAN_TAG,
  PLANETARY_PHASE_TAG,
  VENUSIAN_TAG,
} from "./phases.constants";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
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
    private readonly elongationSpansService: ElongationSpansService,
  ) {
    this.logger.setContext(PhasesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Detects planetary phase events at a minute for Venus, Mercury, and Mars.
   * @deprecated Use the per-planet phase getters.
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
   * Pairs planetary rise and set events into visibility spans: morning-star and
   * evening-star periods of Venus and Mercury, and the widening and closing
   * halves of every apparition, Mars's at opposition.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const planetaryPhaseEvents = events.filter((event) =>
      event.tags.includes(PLANETARY_PHASE_TAG),
    );
    const byPlanet = (marker: string): DetectedCalendarEvent[] =>
      planetaryPhaseEvents.filter((event) => event.tags.includes(marker));
    const progressiveEvents = [
      ...this.venusianPhaseService.getVenusianPhaseProgressiveEvents(
        byPlanet(VENUSIAN_TAG),
      ),
      ...this.mercurianPhaseService.getMercurianPhaseProgressiveEvents(
        byPlanet(MERCURIAN_TAG),
      ),
      ...this.elongationSpansService.detectProgressive(planetaryPhaseEvents),
    ];

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
