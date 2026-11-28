import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { MonthlyLunarCycleEdgesService } from "./monthly-lunar-cycle-edges.service";
import { MonthlyLunarCycleModule } from "./monthly-lunar-cycle.module";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";

/** Timeout for searches over the real ephemeris, sized for CI. */
const SEARCH_TIMEOUT_MILLISECONDS = 60_000;

// The Full Moon of 3 March 2026 is at 11:38 UTC, USNO's time.
const window = {
  end: moment.utc("2026-03-05T23:59:00Z"),
  start: moment.utc("2026-03-05T00:00:00Z"),
};

describe(
  MonthlyLunarCycleEdgesService,
  { timeout: SEARCH_TIMEOUT_MILLISECONDS },
  () => {
    let events: DetectedCalendarEvent[];

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
          LoggerModule,
          MonthlyLunarCycleModule,
        ],
      }).compile();
      const service = await module.resolve(MonthlyLunarCycleEdgesService);

      events = service.findEdgeEvents(window);
    });

    const phases = (): DetectedCalendarEvent[] =>
      events.filter((event) => event.tags.includes("Monthly Lunar Cycle"));
    const apsides = (): DetectedCalendarEvent[] =>
      events.filter((event) => event.tags.includes("Lunar Apsides"));

    it("finds the phase underway at the window start where it began, to the minute USNO gives", () => {
      const [before] = phases();

      expect(before?.tags).toContain("Full");
      expect(
        Math.abs(before?.start.diff("2026-03-03T11:38:00Z", "minutes") ?? 99),
      ).toBeLessThanOrEqual(2);
    });

    it("finds the next phase after the window end", () => {
      const after = phases().at(-1);

      expect(after?.tags).toContain("Waning Gibbous");
      expect(after?.start.isAfter(window.end)).toBe(true);
    });

    it("finds the apsis before the window start and the one after its end", () => {
      const [before, after] = apsides();

      expect(before?.start.isBefore(window.start)).toBe(true);
      expect(after?.start.isAfter(window.end)).toBe(true);
      expect(before?.tags).not.toStrictEqual(after?.tags);
    });
  },
);
