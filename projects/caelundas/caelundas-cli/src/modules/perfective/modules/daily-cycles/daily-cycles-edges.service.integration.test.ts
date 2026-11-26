import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { DailyCyclesEdgesService } from "./daily-cycles-edges.service";
import { DailyCyclesModule } from "./daily-cycles.module";

import type { Input } from "../../../input/input.types";

/** Timeout for searches over the real ephemeris, sized for CI. */
const SEARCH_TIMEOUT_MILLISECONDS = 60_000;

const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };

/** Places around the equator, so the Moon is up at one of them at any minute. */
const LONGITUDES = [-135, -90, -45, 0, 45, 90, 135, 180];

describe(
  DailyCyclesEdgesService,
  { timeout: SEARCH_TIMEOUT_MILLISECONDS },
  () => {
    let service: DailyCyclesEdgesService;

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
          LoggerModule,
          DailyCyclesModule,
        ],
      }).compile();
      service = await module.resolve(DailyCyclesEdgesService);
    });

    it("finds the moonrise and moonset either side of a window the Moon is up through", () => {
      // The Moon, a day past full, is up through the night of 4 March 2026.
      const window = {
        end: moment.utc("2026-03-05T07:00:00Z"),
        start: moment.utc("2026-03-05T05:00:00Z"),
      };

      const events = service.findEdgeEvents(window, philadelphia as Input);

      expect(events.map((event) => event.description)).toStrictEqual([
        "Moonrise",
        "Moonset",
      ]);
      expect(events[0]?.start.isBefore(window.start)).toBe(true);
      expect(events[1]?.start.isAfter(window.end)).toBe(true);
    });

    it("finds the moonset before and the moonrise after a window the Moon is down through", () => {
      // The Moon has set by midday.
      const window = {
        end: moment.utc("2026-03-05T17:00:00Z"),
        start: moment.utc("2026-03-05T16:00:00Z"),
      };

      const events = service.findEdgeEvents(window, philadelphia as Input);

      expect(events.map((event) => event.description)).toStrictEqual([
        "Moonset",
        "Moonrise",
      ]);
    });

    it("clips the moonrise a window at the range's first minute lacks to that minute", () => {
      const first = moment.utc("1900-01-01T00:00:00Z");
      const events = LONGITUDES.flatMap((longitude) =>
        service.findEdgeEvents(
          { end: first.clone().add(1, "hour"), start: first },
          { latitude: 0, longitude } as Input,
        ),
      );

      expect(
        events.map((event) => [event.description, event.start.toISOString()]),
      ).toContainEqual(["Moonrise", "1900-01-01T00:00:00.000Z"]);
    });

    it("clips the moonset a window at the range's last minute lacks to that minute", () => {
      const last = moment.utc("2100-12-31T23:59:00Z");
      const events = LONGITUDES.flatMap((longitude) =>
        service.findEdgeEvents(
          { end: last, start: last.clone().subtract(1, "hour") },
          { latitude: 0, longitude } as Input,
        ),
      );

      expect(
        events.map((event) => [event.description, event.start.toISOString()]),
      ).toContainEqual(["Moonset", "2100-12-31T23:59:00.000Z"]);
    });
  },
);
