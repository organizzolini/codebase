import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProgressiveUtilitiesService } from "../../../../../progressive/progressive-utilities.service";
import {
  CLOSING,
  ELONGATION_PLANETS,
  ELONGATION_SIDES,
  MARS_SPAN_KINDS,
  PHASE_EVENT_BASE_TAGS,
  WIDENING,
} from "../../phases.constants";

import type { DetectedCalendarEvent } from "../../../../../calendar-events/calendar-events.types";
import type { ElongationSpanKind } from "../../phases.types";

/**
 * Builds the two halves of an apparition of Mercury or Venus: from its rise to
 * its greatest elongation, while the planet widens from the Sun, and from the
 * greatest elongation to its set, while it closes on the Sun again. Mars
 * widens from its morning rise to opposition and closes to its evening set.
 */
@Injectable()
export class ElongationSpansService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly progressiveUtilitiesService: ProgressiveUtilitiesService,
  ) {
    this.logger.setContext(ElongationSpansService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds one half of an apparition from its two points. */
  private buildSpan(
    kind: ElongationSpanKind,
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    const { from, planet, side, stage, to } = kind;
    const title = `${planet.name} ${side.name} Star ${stage}`;

    return {
      description: `${title} (${from} to ${to})`,
      end: ending.start,
      start: beginning.start,
      summary: `${planet.symbol}${side.symbol} ${title}`,
      tags: [...PHASE_EVENT_BASE_TAGS, planet.marker, `${side.name} ${stage}`],
    };
  }

  // 🌎 Public Methods

  /**
   * The widening and closing spans of each apparition: a rise pairs with the
   * next greatest elongation, which pairs with the next set.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const kinds: readonly ElongationSpanKind[] = [
      ...ELONGATION_PLANETS.flatMap((planet) =>
        ELONGATION_SIDES.flatMap((side) => [
          {
            from: side.riseTag,
            planet,
            side,
            stage: WIDENING,
            to: side.elongationTag,
          },
          {
            from: side.elongationTag,
            planet,
            side,
            stage: CLOSING,
            to: side.setTag,
          },
        ]),
      ),
      ...MARS_SPAN_KINDS,
    ];

    return kinds.flatMap((kind) => {
      const planetEvents = events.filter((event) =>
        event.tags.includes(kind.planet.marker),
      );
      const withTag = (tag: string): DetectedCalendarEvent[] =>
        planetEvents.filter((event) => event.tags.includes(tag));

      return this.progressiveUtilitiesService
        .pairProgressiveEvents(
          withTag(kind.from),
          withTag(kind.to),
          `${kind.planet.name} ${kind.side.name} ${kind.stage}`,
        )
        .map(([beginning, ending]) => this.buildSpan(kind, beginning, ending));
    });
  }
}
