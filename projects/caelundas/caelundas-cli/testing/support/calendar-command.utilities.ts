import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import moment from "moment-timezone";
import { vi } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "../../src/caelundas-cli.constants";
import { CaelundasCommand } from "../../src/modules/caelundas/caelundas.command";
import { CalendarEventsModule } from "../../src/modules/calendar-events/calendar-events.module";
import { EphemerisService } from "../../src/modules/ephemeris/ephemeris.service";
import { InputModule } from "../../src/modules/input/input.module";
import { PerfectiveService } from "../../src/modules/perfective/perfective.service";
import { ProgressiveService } from "../../src/modules/progressive/progressive.service";

import type { DetectedCalendarEvent } from "../../src/modules/calendar-events/calendar-events.types";
import type { Input } from "../../src/modules/input/input.types";
import type { CalendarCommandRun } from "./calendar-command.types";

/** An event the stand-in detector knows about, with its times in UTC. */
export function detectable(
  summary: string,
  start: string,
  end = start,
): DetectedCalendarEvent {
  return {
    description: `${summary} description`,
    end: moment.utc(end),
    start: moment.utc(start),
    summary,
    tags: ["aspects", "e2e"],
  };
}

/**
 * Runs the real command once into the test database; each run boots a fresh context, since ConfigModule reads variables once.
 */
export async function runCalendarCommand(
  run: CalendarCommandRun,
  detectableEvents: readonly DetectedCalendarEvent[],
): Promise<void> {
  vi.stubEnv("START_DATE", run.startDate);
  vi.stubEnv("END_DATE", run.endDate);
  vi.stubEnv("LATITUDE", String(run.latitude));
  vi.stubEnv("LONGITUDE", String(run.longitude));

  /** The run's application: the real command, with stand-in detectors. */
  @Module({
    imports: [
      ConfigModule.forRoot({
        ignoreEnvFile: true,
        isGlobal: true,
        validate: (config: Record<string, unknown>) =>
          environmentSchema.parse(config),
      }),
      LoggerModule,
      CalendarEventsModule,
      InputModule,
    ],
    providers: [
      CaelundasCommand,
      {
        provide: EphemerisService,
        useValue: { verifyFiles: (): void => undefined },
      },
      {
        provide: PerfectiveService,
        useValue: {
          detect: (input: Input): DetectedCalendarEvent[] =>
            detectableEvents.filter(
              (event) =>
                event.start.isSameOrAfter(input.start) &&
                event.start.isBefore(input.end.clone().add(1, "day")),
            ),
        },
      },
      {
        provide: ProgressiveService,
        useValue: { detect: (): DetectedCalendarEvent[] => [] },
      },
    ],
  })
  class CalendarCommandRunModule {}

  const context = await NestFactory.createApplicationContext(
    CalendarCommandRunModule,
    { logger: false },
  );

  try {
    await context.get(CaelundasCommand).run();
  } finally {
    await context.close();
  }
}
