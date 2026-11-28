import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { BuildInstantEventArguments } from "./calendar.types";

/**
 * NestJS service that builds the instant events the detectors report.
 */
@Injectable()
export class CalendarService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(CalendarService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Builds a one-minute-point event where start and end are the same timestamp.
   */
  buildInstantEvent(args: BuildInstantEventArguments): DetectedCalendarEvent {
    const { date, description, logger, summary, tags, timezone } = args;
    const dateString = date.clone().tz(timezone).toISOString(true);

    logger.info("🗓️ Built a calendar event", undefined, {
      at: dateString,
      summary,
    });

    return {
      description,
      end: date,
      start: date,
      summary,
      tags,
    };
  }
}
