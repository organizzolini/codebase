import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { AspectsUtilitiesService } from "../aspects/aspects-utilities.service";
import {
  aspectBodies as specialtyAspectBodies,
  specialtyAspects,
} from "../caelundas/caelundas.constants";

import { SpecialtyAspectsEventService } from "./specialty-aspects-event.service";
import { SpecialtyAspectsProgressiveService } from "./specialty-aspects-progressive.service";

import type {
  AspectBodies,
  LongitudesWindow,
  SimpleAspectDetectorArguments,
} from "../aspects/aspects.types";
import type {
  AspectPhase,
  Body,
  SpecialtyAspect,
} from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type { Moment } from "moment-timezone";

/**
 * Detects and formats specialty (harmonic) aspect events between celestial bodies.
 *
 * Covers quintile (72°), biquintile (144°), septile (~51.4°), and novile (40°).
 * These aspects represent subtler energetic relationships and use narrower orbs.
 * Includes progressive event pairing for duration-aware tracking.
 *
 * @see {@link AspectsUtilitiesService} for orb and angle configuration
 */
@Injectable()
export class SpecialtyAspectsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly aspectsUtilitiesService: AspectsUtilitiesService,
    private readonly specialtyAspectsEventService: SpecialtyAspectsEventService,
    private readonly specialtyAspectsProgressiveService: SpecialtyAspectsProgressiveService,
  ) {
    this.logger.setContext(SpecialtyAspectsService.name);
    this.detectAspectPhase = aspectsUtilitiesService.getIsAspect([
      ...specialtyAspects,
    ]);
  }

  // 🔐 Private Fields

  private readonly detectAspectPhase: ReturnType<
    AspectsUtilitiesService["getIsAspect"]
  >;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Detects a specialty-aspect event for one body pair using three-point longitude sampling. */
  private detectBodyPairEvent(args: {
    body1: Body;
    body2: Body;
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
    nextMinute: Moment;
    previousMinute: Moment;
  }): DetectedCalendarEvent | null {
    const {
      body1,
      body2,
      coordinateEphemerisByBody,
      minute,
      nextMinute,
      previousMinute,
    } = args;
    const longitudes = this.detectBodyPairLongitudes({
      body1,
      body2,
      coordinateEphemerisByBody,
      minute,
      nextMinute,
      previousMinute,
    });
    const phase = this.detectAspectPhase(longitudes);
    if (!phase) return null;
    return this.buildSpecialtyAspectEvent({
      body1,
      body2,
      longitudeBody1: longitudes.currentLongitudeBody1,
      longitudeBody2: longitudes.currentLongitudeBody2,
      phase,
      timestamp: minute,
    });
  }

  /** Reads previous/current/next longitudes for a body pair from coordinate ephemerides. */
  private detectBodyPairLongitudes(args: {
    body1: Body;
    body2: Body;
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
    nextMinute: Moment;
    previousMinute: Moment;
  }): LongitudesWindow {
    const {
      body1,
      body2,
      coordinateEphemerisByBody,
      minute,
      nextMinute,
      previousMinute,
    } = args;
    const body1LongitudesWindow =
      this.specialtyAspectsEventService.getBodyLongitudesWindow({
        ephemeris: coordinateEphemerisByBody[body1],
        minute,
        nextMinute,
        previousMinute,
      });
    const body2LongitudesWindow =
      this.specialtyAspectsEventService.getBodyLongitudesWindow({
        ephemeris: coordinateEphemerisByBody[body2],
        minute,
        nextMinute,
        previousMinute,
      });
    return {
      currentLongitudeBody1: body1LongitudesWindow.current,
      currentLongitudeBody2: body2LongitudesWindow.current,
      nextLongitudeBody1: body1LongitudesWindow.next,
      nextLongitudeBody2: body2LongitudesWindow.next,
      previousLongitudeBody1: body1LongitudesWindow.previous,
      previousLongitudeBody2: body2LongitudesWindow.previous,
    };
  }

  // 🌎 Public Methods

  /**
   * Creates a calendar event for a specialty aspect occurrence, with body symbols and tagging.
   * @see {@link getSpecialtyAspect} for aspect type determination
   */
  buildSpecialtyAspectEvent(args: {
    body1: Body;
    body2: Body;
    longitudeBody1: number;
    longitudeBody2: number;
    phase: AspectPhase;
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const { body1, body2, longitudeBody1, longitudeBody2, phase, timestamp } =
      args;
    const specialtyAspect = this.getSpecialtyAspect({
      longitudeBody1,
      longitudeBody2,
    });
    if (!specialtyAspect) {
      this.logger.error("📐 Missing specialty aspect", undefined, {
        at: timestamp.toISOString(),
        body1,
        body2,
        longitudeBody1,
        longitudeBody2,
      });
      throw new Error("No specialty aspect found");
    }
    return this.specialtyAspectsEventService.assembleSpecialtyAspectEvent({
      body1,
      body2,
      phase,
      specialtyAspect,
      timestamp,
    });
  }

  /**
   * Detects specialty aspect events within one minute, labelling each as forming, exact or dissolving.
   */
  detect(args: {
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
  }): DetectedCalendarEvent[] {
    return AspectsUtilitiesService.scanUniqueBodyPairsAtMinute({
      bodies: specialtyAspectBodies,
      coordinateEphemerisByBody: args.coordinateEphemerisByBody,
      detect: (argumentsObject) => this.detectBodyPairEvent(argumentsObject),
      minute: args.minute,
    });
  }

  /**
   * Lists specialty aspects in orb at this minute and the adjacent minutes, seeding a sweep's registry at window start.
   */
  detectActive(args: SimpleAspectDetectorArguments): AspectBodies[] {
    const { coordinateEphemerisByBody, minute } = args;
    return this.aspectsUtilitiesService.getActiveAspectBodies({
      aspects: specialtyAspects,
      bodies: specialtyAspectBodies,
      getLongitudesWindow: (window) =>
        this.specialtyAspectsEventService.getBodyLongitudesWindow({
          ...window,
          ephemeris: coordinateEphemerisByBody[window.body],
        }),
      minute,
    });
  }

  /**
   * Converts instantaneous specialty aspect events into progressive events spanning each aspect's active period.
   * @see {@link pairProgressiveEvents} for forming/dissolving pairing logic
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    return this.specialtyAspectsProgressiveService.detectProgressive(events);
  }

  /**
   * Returns the first specialty aspect between two bodies, or `null` if none is within orb.
   *
   */
  getSpecialtyAspect(args: {
    longitudeBody1: number;
    longitudeBody2: number;
  }): null | SpecialtyAspect {
    return this.specialtyAspectsEventService.getSpecialtyAspect(args);
  }

  /**
   * Classifies the phase (forming, perfective or dissolving) between two bodies over three minutes, or `null` when out of orb.
   */
  getSpecialtyAspectPhase(args: {
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
