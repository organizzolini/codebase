import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { bodyDisplayName } from "../caelundas/caelundas.types";

import type { DetectedCalendarEvent } from "../database/database.types";
import type { TypedAspectParts } from "./progressive.types";

/**
 * Shared helper service for building progressive aspect events.
 */
@Injectable()
export class ProgressiveAspectService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ProgressiveAspectService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Create a stable group key from sorted body labels and aspect label.
   */
  buildAspectGroupKeyFromTags({
    aspects,
    bodies,
    tags,
  }: {
    aspects: readonly string[];
    bodies: readonly string[];
    tags: string[];
  }): string {
    const bodyLabels = new Set(bodies.map((body) => bodyDisplayName(body)));
    const aspectLabels = new Set(aspects.map((aspect) => _.startCase(aspect)));

    const bodiesCapitalized = _.sortBy(
      tags.filter((tag) => bodyLabels.has(tag)),
    );
    const aspectCapitalized = tags.find((tag) => aspectLabels.has(tag));

    if (bodiesCapitalized.length === 2 && aspectCapitalized !== undefined) {
      return `${bodiesCapitalized[0]}-${aspectCapitalized}-${bodiesCapitalized[1]}`;
    }

    return "";
  }

  /**
   * Build progressive duration events for an aspect tag by pairing Forming/Dissolving boundaries.
   */
  buildProgressiveAspectEvents({
    aspectTag,
    events,
    getAspectGroupKey,
    getProgressiveEvent,
    pairProgressiveEvents,
    tagLabel,
  }: {
    aspectTag: string;
    events: DetectedCalendarEvent[];
    getAspectGroupKey: (event: DetectedCalendarEvent) => string;
    getProgressiveEvent: (
      beginning: DetectedCalendarEvent,
      ending: DetectedCalendarEvent,
    ) => DetectedCalendarEvent;
    pairProgressiveEvents: (
      beginnings: DetectedCalendarEvent[],
      endings: DetectedCalendarEvent[],
      label: string,
    ) => [DetectedCalendarEvent, DetectedCalendarEvent][];
    tagLabel: string;
  }): DetectedCalendarEvent[] {
    const aspectEvents = events.filter((event) =>
      event.tags.includes(aspectTag),
    );

    const groupedAspectEvents = _.groupBy(aspectEvents, (event) =>
      getAspectGroupKey(event),
    );

    const progressiveEvents: DetectedCalendarEvent[] = [];
    for (const [aspectGroupKey, aspectGroupEvents] of Object.entries(
      groupedAspectEvents,
    )) {
      if (!aspectGroupKey) {
        this.logger.warn(
          "📐 Skipping progressive aspect events with an empty group key",
          undefined,
          {
            aspectTag,
            events: aspectGroupEvents.length,
            sample: aspectGroupEvents[0]?.tags,
          },
        );
        continue;
      }

      const formingEvents = aspectGroupEvents.filter((event) =>
        event.tags.includes("Forming"),
      );
      const dissolvingEvents = aspectGroupEvents.filter((event) =>
        event.tags.includes("Dissolving"),
      );

      const pairs = pairProgressiveEvents(
        formingEvents,
        dissolvingEvents,
        `${tagLabel} ${aspectGroupKey}`,
      );

      progressiveEvents.push(
        ...pairs.map(([beginning, ending]) =>
          getProgressiveEvent(beginning, ending),
        ),
      );
    }

    return progressiveEvents;
  }

  /**
   * Builds progressive events for one simple-aspect family, optionally constrained to one precomputed group key.
   */
  buildSimpleAspectFamilyProgressiveEvents({
    aspectTag,
    events,
    fixedAspectGroupKey,
    getAspectGroupKey,
    getProgressiveEvent,
    pairProgressiveEvents,
    tagLabel,
  }: {
    aspectTag: string;
    events: DetectedCalendarEvent[];
    fixedAspectGroupKey?: string;
    getAspectGroupKey: (event: DetectedCalendarEvent) => string;
    getProgressiveEvent: (
      beginning: DetectedCalendarEvent,
      ending: DetectedCalendarEvent,
    ) => DetectedCalendarEvent;
    pairProgressiveEvents: (
      beginnings: DetectedCalendarEvent[],
      endings: DetectedCalendarEvent[],
      label: string,
    ) => [DetectedCalendarEvent, DetectedCalendarEvent][];
    tagLabel: string;
  }): DetectedCalendarEvent[] {
    return this.buildProgressiveAspectEvents({
      aspectTag,
      events,
      getAspectGroupKey:
        fixedAspectGroupKey === undefined
          ? getAspectGroupKey
          : () => fixedAspectGroupKey,
      getProgressiveEvent,
      pairProgressiveEvents,
      tagLabel,
    });
  }

  /**
   * Create a single progressive event for a simple aspect (major, minor, or specialty).
   */
  createSimpleAspectProgressiveEvent<
    TAspect extends string,
    TBody extends string,
  >({
    aspects,
    aspectTag,
    beginning,
    bodies,
    ending,
    isAspect,
    isBody,
    symbolByAspect,
    symbolByBody,
  }: {
    aspects: readonly TAspect[];
    aspectTag: string;
    beginning: DetectedCalendarEvent;
    bodies: readonly TBody[];
    ending: DetectedCalendarEvent;
    isAspect: (value: string) => value is TAspect;
    isBody: (value: string) => value is TBody;
    symbolByAspect: Readonly<Record<TAspect, string>>;
    symbolByBody: Readonly<Record<TBody, string>>;
  }): DetectedCalendarEvent {
    const {
      aspect,
      aspectCapitalized,
      body1,
      body1Capitalized,
      body2,
      body2Capitalized,
    } = this.extractTypedAspectParts<TAspect, TBody>({
      aspects,
      bodies,
      isAspect,
      isBody,
      tags: beginning.tags,
    });

    const body1Symbol = symbolByBody[body1];
    const body2Symbol = symbolByBody[body2];
    const aspectSymbol = symbolByAspect[aspect];

    return {
      description: `${body1Capitalized} ${aspect} ${body2Capitalized}`,
      end: ending.start,
      start: beginning.start,
      summary: `${body1Symbol}${aspectSymbol}${body2Symbol} ${body1Capitalized} ${aspect} ${body2Capitalized}`,
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        aspectTag,
        body1Capitalized,
        body2Capitalized,
        aspectCapitalized,
      ],
    };
  }

  /**
   * Extract typed body/aspect values from event tags using aspect/body registries.
   */
  extractTypedAspectParts<TAspect extends string, TBody extends string>({
    aspects,
    bodies,
    isAspect,
    isBody,
    tags,
  }: {
    aspects: readonly TAspect[];
    bodies: readonly TBody[];
    isAspect: (value: string) => value is TAspect;
    isBody: (value: string) => value is TBody;
    tags: string[];
  }): TypedAspectParts<TAspect, TBody> {
    const bodyLabels = new Set(bodies.map((body) => bodyDisplayName(body)));
    const aspectLabels = new Set(aspects.map((aspect) => _.startCase(aspect)));

    const bodiesCapitalized = _.sortBy(
      tags.filter((tag) => bodyLabels.has(tag)),
    );
    const aspectCapitalized = tags.find((tag) => aspectLabels.has(tag));

    if (bodiesCapitalized.length !== 2 || aspectCapitalized === undefined) {
      throw new Error(
        `Could not extract aspect info from tags: ${tags.join(", ")}`,
      );
    }

    const body1Capitalized = bodiesCapitalized[0] ?? "";
    const body2Capitalized = bodiesCapitalized[1] ?? "";
    const aspectLower = aspectCapitalized.toLowerCase();
    const body1Lower = body1Capitalized.toLowerCase();
    const body2Lower = body2Capitalized.toLowerCase();

    if (!isAspect(aspectLower) || !isBody(body1Lower) || !isBody(body2Lower)) {
      throw new Error(
        `Could not extract typed values from tags: ${tags.join(", ")}`,
      );
    }

    return {
      aspect: aspectLower,
      aspectCapitalized,
      body1: body1Lower,
      body1Capitalized,
      body2: body2Lower,
      body2Capitalized,
    };
  }

  /**
   * Typed extraction wrapper with a normalized error message for compatibility call sites.
   */
  extractTypedAspectPartsOrThrow<TAspect extends string, TBody extends string>({
    aspects,
    bodies,
    errorMessage,
    isAspect,
    isBody,
    tags,
  }: {
    aspects: readonly TAspect[];
    bodies: readonly TBody[];
    errorMessage: string;
    isAspect: (value: string) => value is TAspect;
    isBody: (value: string) => value is TBody;
    tags: string[];
  }): TypedAspectParts<TAspect, TBody> {
    try {
      return this.extractTypedAspectParts({
        aspects,
        bodies,
        isAspect,
        isBody,
        tags,
      });
    } catch (originalError) {
      this.logger.error("📐 Failed extracting typed aspect parts", undefined, {
        reason:
          originalError instanceof Error
            ? originalError.message
            : String(originalError),
        tags,
      });
      throw new Error(errorMessage, { cause: originalError });
    }
  }
}
