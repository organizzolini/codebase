import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { AnnualSolarCycleEdgesService } from "./annual-solar-cycle-edges.service";
import { AnnualSolarCycleModule } from "./annual-solar-cycle.module";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";

/** Timeout for searches over the real ephemeris, sized for CI. */
const SEARCH_TIMEOUT_MILLISECONDS = 60_000;

// Between the vernal equinox (20 March 2026) and the first hexadecan (22.5°).
const window = {
  end: moment.utc("2026-03-26T23:59:00Z"),
  start: moment.utc("2026-03-25T00:00:00Z"),
};

describe(
  AnnualSolarCycleEdgesService,
  { timeout: SEARCH_TIMEOUT_MILLISECONDS },
  () => {
    let events: DetectedCalendarEvent[];

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
          LoggerModule,
          AnnualSolarCycleModule,
        ],
      }).compile();
      const service = await module.resolve(AnnualSolarCycleEdgesService);

      events = service.findEdgeEvents(window);
    });

    const named = (tag: string): DetectedCalendarEvent[] =>
      events.filter((event) => event.tags.includes(tag));

    it("finds the equinox the spring began at, to the minute", () => {
      const [equinox] = named("Vernal Equinox");

      // The vernal equinox of 2026 is at 14:46 UTC.
      expect(
        Math.abs(equinox?.start.diff("2026-03-20T14:46:00Z", "minutes") ?? 99),
      ).toBeLessThanOrEqual(2);
    });

    it("finds the hexadecan after the window and the solstice that ends the season", () => {
      expect(named("First Hexadecan")[0]?.start.isAfter(window.end)).toBe(true);
      expect(named("Summer Solstice")[0]?.start.format("YYYY-MM-DD")).toBe(
        "2026-06-21",
      );
    });

    it("finds the perihelion before the window and the aphelion after it", () => {
      expect(named("Perihelion")[0]?.start.format("YYYY-MM-DD")).toBe(
        "2026-01-03",
      );
      expect(named("Aphelion")[0]?.start.format("YYYY-MM-DD")).toBe(
        "2026-07-06",
      );
    });
  },
);
