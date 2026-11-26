import { Inject, Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { CalendarEventsService } from "../calendar-events/calendar-events.service";
import { EphemerisService } from "../ephemeris/ephemeris.service";
import { InputService } from "../input/input.service";
import { PerfectiveService } from "../perfective/perfective.service";
import { ProgressiveService } from "../progressive/progressive.service";

/**
 * CLI entry point for caelundas. Reads observer coordinates and date range from environment variables, detects and upserts events into Postgres, and refreshes the read model.
 */
@Command({
  description: "Run the caelundas command",
  name: "caelundas",
})
@Injectable()
export class CaelundasCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    @Inject(InputService)
    private readonly inputService: InputService,
    @Inject(PerfectiveService)
    private readonly perfectiveEventsService: PerfectiveService,
    @Inject(ProgressiveService)
    private readonly progressiveEventsService: ProgressiveService,
    @Inject(CalendarEventsService)
    private readonly calendarEventsService: CalendarEventsService,
    @Inject(EphemerisService)
    private readonly ephemerisService: EphemerisService,
  ) {
    super();
    this.logger.setContext(CaelundasCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs the calendar pipeline: detect, then store.
   */
  async run(): Promise<void> {
    this.logger.debug("🚀 Starting a caelundas run", undefined, {
      arguments: process.argv.slice(2),
    });

    this.ephemerisService.verifyFiles();

    const input = this.inputService.parse();

    const perfectiveEvents = this.perfectiveEventsService.detect(input);
    this.logger.info("🔎 Detected perfective events", undefined, {
      count: perfectiveEvents.length,
    });

    const progressiveEvents = this.progressiveEventsService.detect(
      perfectiveEvents,
      input,
    );
    this.logger.info("🔎 Detected progressive events", undefined, {
      count: progressiveEvents.length,
    });

    const allEvents = [...perfectiveEvents, ...progressiveEvents].toSorted(
      (a, b) => a.start.valueOf() - b.start.valueOf(),
    );

    await this.calendarEventsService.upsert(allEvents, {
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone,
    });

    this.logger.info("🏁 Completed a caelundas run", undefined, {
      detectedEvents: allEvents.length,
    });
  }
}
