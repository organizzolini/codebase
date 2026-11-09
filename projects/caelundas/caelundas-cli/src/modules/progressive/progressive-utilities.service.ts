import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";

/**
 * Utility service for pairing progressive events.
 *
 * Wraps the `pairProgressiveEvents` algorithm as an injectable provider so
 * all consumers can receive it through NestJS dependency injection instead of
 * importing the standalone utility function directly.
 */
@Injectable()
export class ProgressiveUtilitiesService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ProgressiveUtilitiesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Walks both lists in start order, pairing each beginning with the first
   * ending at or after it unless the next beginning comes first.
   */
  private pairInStartOrder(
    beginnings: DetectedCalendarEvent[],
    endings: DetectedCalendarEvent[],
  ): [DetectedCalendarEvent, DetectedCalendarEvent][] {
    const byStart = (
      first: DetectedCalendarEvent,
      second: DetectedCalendarEvent,
    ): number => first.start.valueOf() - second.start.valueOf();
    const orderedBeginnings = beginnings.toSorted(byStart);
    const orderedEndings = endings.toSorted(byStart);
    const pairs: [DetectedCalendarEvent, DetectedCalendarEvent][] = [];
    let endingIndex = 0;

    for (const [index, beginning] of orderedBeginnings.entries()) {
      while (
        orderedEndings[endingIndex]?.start.isBefore(beginning.start) === true
      ) {
        endingIndex++;
      }

      const ending = orderedEndings[endingIndex];
      const nextBeginning = orderedBeginnings[index + 1];
      if (
        ending !== undefined &&
        (nextBeginning === undefined || byStart(ending, nextBeginning) <= 0)
      ) {
        pairs.push([beginning, ending]);
        endingIndex++;
      }
    }

    return pairs;
  }

  // 🌎 Public Methods

  /**
   * Pairs a compound pattern's forming and dissolving boundaries into occurrences;
   * a boundary repeated in a minute counts once, and same-minute pairs are dropped.
   */
  pairCompoundBoundaries(
    groupEvents: DetectedCalendarEvent[],
    label: string,
  ): [DetectedCalendarEvent, DetectedCalendarEvent][] {
    const boundariesFor = (phase: string): DetectedCalendarEvent[] =>
      _.uniqBy(
        groupEvents.filter((event) => event.tags.includes(phase)),
        (event) => event.start.valueOf(),
      );

    return this.pairProgressiveEvents(
      boundariesFor("Forming"),
      boundariesFor("Dissolving"),
      label,
    ).filter(([forming, dissolving]) =>
      dissolving.start.isAfter(forming.start),
    );
  }

  /**
   * Pairs each beginning with the earliest unused ending no later than the next
   * beginning; unpaired events are dropped and logged.
   */
  pairProgressiveEvents(
    beginnings: DetectedCalendarEvent[],
    endings: DetectedCalendarEvent[],
    label: string,
  ): [DetectedCalendarEvent, DetectedCalendarEvent][] {
    const pairs = this.pairInStartOrder(beginnings, endings);
    const unpairedBeginnings = beginnings.length - pairs.length;
    const unpairedEndings = endings.length - pairs.length;

    if (unpairedBeginnings > 0 || unpairedEndings > 0) {
      this.logger.warn("🔀 Unpaired progressive events", undefined, {
        label,
        paired: pairs.length,
        unpairedBeginnings,
        unpairedEndings,
      });
    }

    return pairs;
  }
}
