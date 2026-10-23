import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import { eclipseTypeLabelByType } from "./eclipses.constants";

import type { EclipsePhase } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../database/database.types";
import type {
  EclipseFrame,
  EclipseType,
  LunarEclipseType,
  SolarEclipseType,
} from "./eclipses.types";
import type { Moment } from "moment-timezone";

/**
 * Builds eclipse calendar events and progressive duration events.
 */
@Injectable()
export class EclipseEventService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly progressiveUtilitiesService: ProgressiveUtilitiesService,
  ) {
    this.logger.setContext(EclipseEventService.name);
  }

  // 🔐 Private Fields

  private readonly phaseLabelByPhase: Record<
    EclipsePhase,
    { symbol: string; word: string }
  > = {
    beginning: { symbol: "▶️", word: "begins" },
    ending: { symbol: "◀️", word: "ends" },
    maximum: { symbol: "🎯", word: "maximum" },
  };

  private readonly symbolByBody = { Lunar: "🌙🐉", Solar: "☀️🐉" };

  private readonly tags = ["Astronomy", "Astrology", "Eclipse"];

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds one eclipse contact event, titled with its type, body and phase,
   * for example "🌐🌙🐉▶️ Total Lunar Eclipse begins".
   */
  private buildEclipseEvent(args: {
    body: "Lunar" | "Solar";
    date: Moment;
    frame: EclipseFrame;
    phase: EclipsePhase;
    type: EclipseType;
  }): DetectedCalendarEvent {
    const { body, date, frame, phase, type } = args;
    const frameLabel =
      frame === "geocentric" ? "Geocentric" : "Topocentric Visibility";
    const frameSymbol = frame === "geocentric" ? "🌐" : "📍";
    const typeLabel = eclipseTypeLabelByType[type];
    const { symbol, word } = this.phaseLabelByPhase[phase];
    const title = `${typeLabel} ${body} Eclipse ${word}`;
    const summary = `${frameSymbol}${this.symbolByBody[body]}${symbol} ${title}`;
    const dateString = date.clone().tz("America/New_York").toISOString(true);

    this.logger.info("🗓️ Built a calendar event", undefined, {
      at: dateString,
      summary,
    });

    return {
      description: `${title} (${frameLabel})`,
      end: date,
      start: date,
      summary,
      tags: [...this.tags, body, frameLabel, typeLabel, _.startCase(phase)],
    };
  }

  /**
   * Builds the span of one eclipse from its beginning to its ending, typed
   * by the beginning's type tag.
   */
  private getEclipseDurationEvent(args: {
    beginning: DetectedCalendarEvent;
    body: "Lunar" | "Solar";
    ending: DetectedCalendarEvent;
    frameLabel: "Geocentric" | "Topocentric Visibility";
  }): DetectedCalendarEvent {
    const { beginning, body, ending, frameLabel } = args;
    const frameSymbol = frameLabel === "Geocentric" ? "🌐" : "📍";
    const typeLabel = Object.values(eclipseTypeLabelByType).find((label) =>
      beginning.tags.includes(label),
    );
    const title = [typeLabel, `${body} Eclipse (${frameLabel})`]
      .filter(Boolean)
      .join(" ");
    return {
      description: title,
      end: ending.start,
      start: beginning.start,
      summary: `${frameSymbol}${this.symbolByBody[body]} ${title}`,
      tags: [...this.tags, body, frameLabel, ...(typeLabel ? [typeLabel] : [])],
    };
  }

  /**
   * Derives progressive frame.
   */
  private getProgressiveEventsForFrame(
    eclipseEvents: DetectedCalendarEvent[],
    frameLabel: "Geocentric" | "Topocentric Visibility",
    body: "Lunar" | "Solar",
  ): DetectedCalendarEvent[] {
    const events = eclipseEvents.filter(
      (event) => event.tags.includes(body) && event.tags.includes(frameLabel),
    );
    const beginnings = events.filter((event) =>
      event.description.includes("begins"),
    );
    const endings = events.filter((event) =>
      event.description.includes("ends"),
    );

    const pairs = this.progressiveUtilitiesService.pairProgressiveEvents(
      beginnings,
      endings,
      `${body.toLowerCase()} eclipse (${frameLabel.toLowerCase()})`,
    );

    return pairs.map(([beginning, ending]) =>
      this.getEclipseDurationEvent({ beginning, body, ending, frameLabel }),
    );
  }

  // 🌎 Public Methods

  /**
   * Creates a lunar eclipse calendar event.
   */
  buildLunarEclipseEvent(args: {
    date: Moment;
    frame: EclipseFrame;
    phase: EclipsePhase;
    type: LunarEclipseType;
  }): DetectedCalendarEvent {
    return this.buildEclipseEvent({ ...args, body: "Lunar" });
  }

  /**
   * Creates a solar eclipse calendar event.
   */
  buildSolarEclipseEvent(args: {
    date: Moment;
    frame: EclipseFrame;
    phase: EclipsePhase;
    type: SolarEclipseType;
  }): DetectedCalendarEvent {
    return this.buildEclipseEvent({ ...args, body: "Solar" });
  }

  /**
   * Builds progressive event spans for eclipse periods.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const eclipseEvents = events.filter((event) =>
      event.tags.includes("Eclipse"),
    );

    return [
      ...this.getProgressiveEventsForFrame(
        eclipseEvents,
        "Geocentric",
        "Lunar",
      ),
      ...this.getProgressiveEventsForFrame(
        eclipseEvents,
        "Geocentric",
        "Solar",
      ),
      ...this.getProgressiveEventsForFrame(
        eclipseEvents,
        "Topocentric Visibility",
        "Lunar",
      ),
      ...this.getProgressiveEventsForFrame(
        eclipseEvents,
        "Topocentric Visibility",
        "Solar",
      ),
    ];
  }
}
