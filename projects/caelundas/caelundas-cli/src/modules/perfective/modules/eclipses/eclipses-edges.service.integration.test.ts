import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { EclipsesEdgesService } from "./eclipses-edges.service";
import { EclipsesModule } from "./eclipses.module";

import type { Input } from "../../../input/input.types";

/** Timeout for scans over the real ephemeris, sized for CI. */
const SEARCH_TIMEOUT_MILLISECONDS = 120_000;

const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };

describe(EclipsesEdgesService, { timeout: SEARCH_TIMEOUT_MILLISECONDS }, () => {
  let service: EclipsesEdgesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
        LoggerModule,
        EclipsesModule,
      ],
    }).compile();
    service = await module.resolve(EclipsesEdgesService);
  });

  // The total lunar eclipse of 3 March 2026 runs from about 08:44 to 14:23
  // UTC for the penumbra, with maximum at 11:33.
  it("finds the beginning before a window that opens mid-eclipse, and the ending after one that closes mid-eclipse", () => {
    const window = {
      end: moment.utc("2026-03-03T11:00:00Z"),
      start: moment.utc("2026-03-03T10:30:00Z"),
    };

    const events = service.findEdgeEvents(window, philadelphia as Input);
    const geocentricLunar = events.filter(
      (event) =>
        event.tags.includes("Lunar") && event.tags.includes("Geocentric"),
    );

    expect(
      geocentricLunar.map((event) => [
        event.tags.at(-1),
        event.start.isBefore(window.start),
      ]),
    ).toContainEqual(["Beginning", true]);
    expect(
      geocentricLunar.map((event) => [
        event.tags.at(-1),
        event.start.isAfter(window.end),
      ]),
    ).toContainEqual(["Maximum", true]);
    expect(
      geocentricLunar.map((event) => [
        event.tags.at(-1),
        event.start.isAfter(window.end),
      ]),
    ).toContainEqual(["Ending", true]);
  });

  it("scans nothing when no eclipse is underway at the window's edges", () => {
    expect(
      service.findEdgeEvents(
        {
          end: moment.utc("2026-03-20T12:00:00Z"),
          start: moment.utc("2026-03-20T00:00:00Z"),
        },
        philadelphia as Input,
      ),
    ).toStrictEqual([]);
  });
});
