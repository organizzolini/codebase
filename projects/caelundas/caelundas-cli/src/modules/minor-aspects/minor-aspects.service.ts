import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { AspectsUtilitiesService } from "../aspects/aspects-utilities.service";
import {
  aspectBodies as minorAspectBodies,
  minorAspects,
} from "../caelundas/caelundas.constants";

import { MinorAspectsEventService } from "./minor-aspects-event.service";
import { MinorAspectsProgressiveService } from "./minor-aspects-progressive.service";

import type {
  AspectBodies,
  SimpleAspectDetectorArguments,
} from "../aspects/aspects.types";
import type {
  AspectPhase,
  Body,
  MinorAspect,
} from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type { DetectBodyPairAspectArguments } from "./minor-aspects.types";
import type { Moment } from "moment-timezone";

/**
 * Detects and formats minor aspect events between celestial bodies.
 *
 * Covers semi-sextile (30°), semi-square (45°), sesquiquadrate (135°), and quincunx (150°)
 * using smaller orbs than major aspects. Includes progressive event pairing for
 * duration-aware tracking.
 *
 * @see {@link AspectsUtilitiesService} for orb and angle configuration
 */
@Injectable()
export class MinorAspectsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly aspectsUtilitiesService: AspectsUtilitiesService,
    private readonly minorAspectsEventService: MinorAspectsEventService,
    private readonly minorAspectsProgressiveService: MinorAspectsProgressiveService,
  ) {
    this.logger.setContext(MinorAspectsService.name);
    this.detectAspectPhase = aspectsUtilitiesService.getIsAspect([
      ...minorAspects,
    ]);
  }

  // 🔐 Private Fields

  private readonly detectAspectPhase: ReturnType<
    AspectsUtilitiesService["getIsAspect"]
  >;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Detects a minor-aspect event for one body pair at a specific minute window. */
  private detectBodyPairAspect(
    args: DetectBodyPairAspectArguments,
  ): DetectedCalendarEvent | null {
    const {
      body1,
      body2,
      coordinateEphemerisByBody,
      minute,
      nextMinute,
      previousMinute,
    } = args;
    const body1LongitudesWindow =
      this.minorAspectsEventService.getLongitudesWindowForBody({
        body: body1,
        coordinateEphemerisByBody,
        minute,
        nextMinute,
        previousMinute,
      });
    const body2LongitudesWindow =
      this.minorAspectsEventService.getLongitudesWindowForBody({
        body: body2,
        coordinateEphemerisByBody,
        minute,
        nextMinute,
        previousMinute,
      });
    const phase = this.detectPhaseFromWindows(
      body1LongitudesWindow,
      body2LongitudesWindow,
    );
    if (!phase) {
      return null;
    }
    return this.buildMinorAspectEvent({
      body1,
      body2,
      longitudeBody1: body1LongitudesWindow.current,
      longitudeBody2: body2LongitudesWindow.current,
      phase,
      timestamp: minute,
    });
  }

  /** Derives minor-aspect phase by comparing three-minute longitude windows for both bodies. */
  private detectPhaseFromWindows(
    body1LongitudesWindow: { current: number; next: number; previous: number },
    body2LongitudesWindow: { current: number; next: number; previous: number },
  ): AspectPhase | null {
    return AspectsUtilitiesService.detectPhaseFromWindows({
      body1LongitudesWindow,
      body2LongitudesWindow,
      detectAspectPhase: this.detectAspectPhase,
    });
  }

  // 🌎 Public Methods

  /**
   * Creates the calendar event for one minor aspect occurrence; throws when no
   * minor aspect is within orb.
   */
  buildMinorAspectEvent(args: {
    body1: Body;
    body2: Body;
    longitudeBody1: number;
    longitudeBody2: number;
    phase: AspectPhase;
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const { body1, body2, longitudeBody1, longitudeBody2, phase, timestamp } =
      args;
    const minorAspect = this.getMinorAspect({ longitudeBody1, longitudeBody2 });
    if (!minorAspect) {
      this.logger.error("📐 Missing minor aspect", undefined, {
        at: timestamp.toISOString(),
        body1,
        body2,
        longitudeBody1,
        longitudeBody2,
      });
      throw new Error("No minor aspect found");
    }
    return this.minorAspectsEventService.assembleMinorAspectEvent({
      body1,
      body2,
      minorAspect,
      phase,
      timestamp,
    });
  }

  /**
   * Detects minor aspects at a minute across configured body pairs (semi-sextile,
   * semi-square, sesquiquadrate, quincunx), with phase from adjacent minutes.
   */
  detect(args: {
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
  }): DetectedCalendarEvent[] {
    return AspectsUtilitiesService.scanUniqueBodyPairsAtMinute({
      bodies: minorAspectBodies,
      coordinateEphemerisByBody: args.coordinateEphemerisByBody,
      detect: (argumentsObject) => this.detectBodyPairAspect(argumentsObject),
      minute: args.minute,
    });
  }

  /**
   * Minor aspects in orb at this minute and adjacent minutes, to seed a sweep's
   * registry at its start.
   */
  detectActive(args: SimpleAspectDetectorArguments): AspectBodies[] {
    const { coordinateEphemerisByBody, minute } = args;
    return this.aspectsUtilitiesService.getActiveAspectBodies({
      aspects: minorAspects,
      bodies: minorAspectBodies,
      getLongitudesWindow: (window) =>
        this.minorAspectsEventService.getLongitudesWindowForBody({
          ...window,
          coordinateEphemerisByBody,
        }),
      minute,
    });
  }

  /**
   * Pairs forming and dissolving minor aspect events into duration events
   * spanning each aspect's full time in orb.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    return this.minorAspectsProgressiveService.detectProgressive(events);
  }

  /**
   * Returns the first minor aspect between two bodies, or `null` if none is within orb.
   *
   */
  getMinorAspect(args: {
    longitudeBody1: number;
    longitudeBody2: number;
  }): MinorAspect | null {
    return this.minorAspectsEventService.getMinorAspect(args);
  }

  /**
   * Classifies a minor aspect's phase (forming, perfective, or dissolving) across
   * three consecutive minutes; null if none is in progress.
   *
   */
  getMinorAspectPhase(args: {
    currentLongitudeBody1: number;
    currentLongitudeBody2: number;
    nextLongitudeBody1: number;
    nextLongitudeBody2: number;
    previousLongitudeBody1: number;
    previousLongitudeBody2: number;
  }): AspectPhase | null {
    return this.detectAspectPhase(args);
  }
}
