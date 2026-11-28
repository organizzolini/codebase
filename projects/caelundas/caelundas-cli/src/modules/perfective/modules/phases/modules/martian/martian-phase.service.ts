import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { symbolByMartianPhase } from "../../../../../caelundas/symbol-caelundas.constants";
import {
  MARTIAN_TAG,
  PHASE_EVENT_BASE_TAGS,
  PHASE_EVENT_TIMEZONE,
} from "../../phases.constants";
import { PhaseCalculationService } from "../calculation/phase-calculation.service";

import type { MartianPhase } from "../../../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../../../calendar-events/calendar-events.types";
import type {
  BuildPlanetPhaseEventArguments,
  MartianPhaseEventArguments,
  PhaseParameters,
} from "../../phases.types";
import type { Moment } from "moment-timezone";

/**
 * Detects Martian phase transitions and visibility events.
 */
@Injectable()
export class MartianPhaseService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly phaseCalculationService: PhaseCalculationService,
  ) {
    this.logger.setContext(MartianPhaseService.name);
  }

  // 🔐 Private Fields

  private static readonly tags = PHASE_EVENT_BASE_TAGS;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Detects martian phases.
   */
  private detectMartianPhases(
    parameters: PhaseParameters,
    minute: Moment,
  ): DetectedCalendarEvent[] {
    const events: DetectedCalendarEvent[] = [];
    const checks: [boolean, MartianPhase][] = [
      [this.phaseCalculationService.isMorningRise(parameters), "morning rise"],
      [this.phaseCalculationService.isMorningSet(parameters), "morning set"],
      [this.phaseCalculationService.isEveningRise(parameters), "evening rise"],
      [this.phaseCalculationService.isEveningSet(parameters), "evening set"],
      [this.phaseCalculationService.isOpposition(parameters), "opposition"],
    ];
    for (const [condition, phase] of checks) {
      if (condition) {
        events.push(this.buildMartianPhaseEvent({ phase, timestamp: minute }));
      }
    }
    return events;
  }

  // 🌎 Public Methods

  /**
   * Creates a Martian phase event; Mars has no elongation maximum, as it
   * reaches 180° from the Sun, at opposition.
   */
  buildMartianPhaseEvent(
    args: BuildPlanetPhaseEventArguments<MartianPhase>,
  ): DetectedCalendarEvent {
    const { phase, timestamp } = args;

    const phaseCapitalized = _.startCase(phase);
    const phaseSymbol = symbolByMartianPhase[phase];

    const description = `Mars ${phaseCapitalized}`;
    const summary = `♂️${phaseSymbol} ${description}`;

    const dateString = this.phaseCalculationService.formatTimeZoneIso(
      timestamp,
      PHASE_EVENT_TIMEZONE,
    );
    this.logger.info("🗓️ Built a calendar event", undefined, {
      at: dateString,
      summary,
    });

    const martianPhaseEvent: DetectedCalendarEvent = {
      description,
      end: timestamp,
      start: timestamp,
      summary,
      tags: [...MartianPhaseService.tags, MARTIAN_TAG, phaseCapitalized],
    };
    return martianPhaseEvent;
  }

  /**
   * Produces Martian phase events for one minute using precomputed phase parameters.
   */
  getMartianPhaseEvents(
    args: MartianPhaseEventArguments,
  ): DetectedCalendarEvent[] {
    const {
      marsCoordinateEphemeris,
      marsIlluminationEphemeris,
      minute,
      sunCoordinateEphemeris,
    } = args;

    const parameters = this.phaseCalculationService.gatherPhaseParameters({
      illuminationEphemeris: marsIlluminationEphemeris,
      minute,
      planetCoordinateEphemeris: marsCoordinateEphemeris,
      sunCoordinateEphemeris,
    });

    return this.detectMartianPhases(parameters, minute);
  }
}
