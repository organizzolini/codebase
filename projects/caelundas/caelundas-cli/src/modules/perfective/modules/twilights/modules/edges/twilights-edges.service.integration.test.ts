import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { TwilightsModule } from "../../twilights.module";

import { TwilightsEdgesService } from "./twilights-edges.service";

import type { DetectedCalendarEvent } from "../../../../../calendar-events/calendar-events.types";
import type { Input } from "../../../../../input/input.types";

/** Timeout for searches over the real ephemeris, sized for CI. */
const SEARCH_TIMEOUT_MILLISECONDS = 60_000;

const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };

describe(
  TwilightsEdgesService,
  { timeout: SEARCH_TIMEOUT_MILLISECONDS },
  () => {
    let service: TwilightsEdgesService;

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
          LoggerModule,
          TwilightsModule,
        ],
      }).compile();
      service = await module.resolve(TwilightsEdgesService);
    });

    const edgesAround = (start: string, end: string): DetectedCalendarEvent[] =>
      service.findEdgeEvents(
        { end: moment.utc(end), start: moment.utc(start) },
        philadelphia as Input,
      );

    it("finds the civil dawn that began the day underway at noon, and the civil dusk that ends it", () => {
      // Noon to 13:00 local on 21 March 2026 is in daylight.
      const events = edgesAround(
        "2026-03-21T16:00:00Z",
        "2026-03-21T17:00:00Z",
      );

      expect(events.map((event) => event.description)).toStrictEqual([
        "Civil Dawn",
        "Civil Dusk",
      ]);
      expect(events[0]?.start.isBefore("2026-03-21T16:00:00Z")).toBe(true);
      expect(events[1]?.start.isAfter("2026-03-21T17:00:00Z")).toBe(true);
    });

    it("finds the astronomical dusk that began the night, and the dawn that ends it", () => {
      // 02:00 to 03:00 local is night.
      const events = edgesAround(
        "2026-03-21T06:00:00Z",
        "2026-03-21T07:00:00Z",
      );

      expect(events.map((event) => event.description)).toStrictEqual([
        "Astronomical Dusk",
        "Astronomical Dawn",
      ]);
    });
  },
);
