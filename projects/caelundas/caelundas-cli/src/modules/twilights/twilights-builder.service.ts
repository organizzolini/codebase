import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import type { DetectedCalendarEvent } from "../database/database.types";
import type { Moment } from "moment-timezone";

/**
 * Builds twilight boundary events and derived interval events from paired transitions.
 */
@Injectable()
export class TwilightsBuilderService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(TwilightsBuilderService.name);
  }

  // 🔐 Private Fields

  private static readonly twilightBaseTags = [
    "Astronomy",
    "Astrology",
    "Twilight",
  ];

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Creates a timestamped twilight transition event and logs the detected boundary. */
  private buildTransitionEvent(
    date: Moment,
    description: string,
    emoji: string,
  ): DetectedCalendarEvent {
    const summary = `${emoji} ${description}`;
    const dateString = date.clone().tz("America/New_York").toISOString(true);
    this.logger.info("🗓️ Built a calendar event", undefined, {
      at: dateString,
      summary,
    });

    return {
      description,
      end: date,
      start: date,
      summary,
      tags: [...TwilightsBuilderService.twilightBaseTags, description],
    };
  }

  // 🌎 Public Methods

  /**
   * Builds the instant when Sun crosses -18 degrees upward.
   */
  buildAstronomicalDawnEvent(date: Moment): DetectedCalendarEvent {
    return this.buildTransitionEvent(date, "Astronomical Dawn", "🌠");
  }

  /**
   * Builds the instant when Sun crosses -18 degrees downward.
   */
  buildAstronomicalDuskEvent(date: Moment): DetectedCalendarEvent {
    return this.buildTransitionEvent(date, "Astronomical Dusk", "🌌");
  }

  /**
   * Builds the instant when Sun crosses -6 degrees upward.
   */
  buildCivilDawnEvent(date: Moment): DetectedCalendarEvent {
    return this.buildTransitionEvent(date, "Civil Dawn", "🌄");
  }

  /**
   * Builds the instant when Sun crosses -6 degrees downward.
   */
  buildCivilDuskEvent(date: Moment): DetectedCalendarEvent {
    return this.buildTransitionEvent(date, "Civil Dusk", "🌇");
  }

  /**
   * Builds the instant when Sun crosses -12 degrees upward.
   */
  buildNauticalDawnEvent(date: Moment): DetectedCalendarEvent {
    return this.buildTransitionEvent(date, "Nautical Dawn", "🌅");
  }

  /**
   * Builds the instant when Sun crosses -12 degrees downward.
   */
  buildNauticalDuskEvent(date: Moment): DetectedCalendarEvent {
    return this.buildTransitionEvent(date, "Nautical Dusk", "🌉");
  }

  /**
   * Builds evening astronomical-twilight interval from transition boundaries.
   */
  getAstronomicalTwilightEveningDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: "Astronomical Twilight (Evening)",
      end: ending.start,
      start: beginning.start,
      summary: "🌌 Astronomical Twilight (Evening)",
      tags: [
        ...TwilightsBuilderService.twilightBaseTags,
        "Astronomical Twilight",
        "Evening",
      ],
    };
  }

  /**
   * Builds morning astronomical-twilight interval from transition boundaries.
   */
  getAstronomicalTwilightMorningDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: "Astronomical Twilight (Morning)",
      end: ending.start,
      start: beginning.start,
      summary: "🌠 Astronomical Twilight (Morning)",
      tags: [
        ...TwilightsBuilderService.twilightBaseTags,
        "Astronomical Twilight",
        "Morning",
      ],
    };
  }

  /**
   * Builds daylight interval between civil dawn and civil dusk boundaries.
   */
  getDaylightDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: "Daylight",
      end: ending.start,
      start: beginning.start,
      summary: "☀️ Daylight",
      tags: [...TwilightsBuilderService.twilightBaseTags, "Daylight"],
    };
  }

  /**
   * Builds evening nautical-twilight interval from transition boundaries.
   */
  getNauticalTwilightEveningDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: "Nautical Twilight (Evening)",
      end: ending.start,
      start: beginning.start,
      summary: "🌉 Nautical Twilight (Evening)",
      tags: [
        ...TwilightsBuilderService.twilightBaseTags,
        "Nautical Twilight",
        "Evening",
      ],
    };
  }

  /**
   * Builds morning nautical-twilight interval from transition boundaries.
   */
  getNauticalTwilightMorningDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: "Nautical Twilight (Morning)",
      end: ending.start,
      start: beginning.start,
      summary: "🌅 Nautical Twilight (Morning)",
      tags: [
        ...TwilightsBuilderService.twilightBaseTags,
        "Nautical Twilight",
        "Morning",
      ],
    };
  }

  /**
   * Builds night interval spanning from astronomical dusk to next astronomical dawn.
   */
  getNightDurationEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    return {
      description: "Night",
      end: ending.start,
      start: beginning.start,
      summary: "🌃 Night",
      tags: [...TwilightsBuilderService.twilightBaseTags, "Night"],
    };
  }
}
