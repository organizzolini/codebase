import { Injectable } from "@nestjs/common";

import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { QuintupleAspectsComposerService } from "./quintuple-aspects-composer.service";

import type { AspectBodies } from "../aspects/aspects.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { Moment } from "moment-timezone";

/**
 * Detects and pairs 5-body quintile patterns (pentagrams) from aspect snapshots.
 */
@Injectable()
export class QuintupleAspectsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly quintupleAspectsComposerService: QuintupleAspectsComposerService,
    private readonly progressiveUtilitiesService: ProgressiveUtilitiesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Detects Pentagram patterns, five bodies in quintile relationships, from stored 2-body aspect events.
   */
  detect(args: {
    currentAspectBodies: AspectBodies[];
    minute: Moment;
    previousAspectBodies: AspectBodies[];
  }): DetectedCalendarEvent[] {
    const { currentAspectBodies, minute, previousAspectBodies } = args;
    return this.quintupleAspectsComposerService.composePentagrams({
      currentAspectBodies,
      minute,
      previousAspectBodies,
    });
  }

  /**
   * Converts instantaneous quintuple events into progressive events spanning the active period, pairing forming and dissolving events.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const progressiveEvents: DetectedCalendarEvent[] = [];
    const groupedEvents =
      this.quintupleAspectsComposerService.groupQuintupleEventsByKey(events);

    for (const [groupKey, group] of Object.entries(groupedEvents)) {
      const pairs = this.progressiveUtilitiesService.pairCompoundBoundaries(
        group,
        `Quintuple Aspect ${groupKey}`,
      );
      for (const [forming, dissolving] of pairs) {
        progressiveEvents.push(
          this.quintupleAspectsComposerService.buildProgressiveQuintupleEvent(
            forming,
            dissolving,
          ),
        );
      }
    }

    return progressiveEvents;
  }
}
