import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { PhasesEdgesService } from "./phases-edges.service";
import { PhasesModule } from "./phases.module";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { Input } from "../../../input/input.types";

/** Timeout for searches over the real ephemeris, sized for CI. */
const SEARCH_TIMEOUT_MILLISECONDS = 120_000;

const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };

describe(PhasesEdgesService, { timeout: SEARCH_TIMEOUT_MILLISECONDS }, () => {
  let service: PhasesEdgesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
        LoggerModule,
        PhasesModule,
      ],
    }).compile();
    service = await module.resolve(PhasesEdgesService);
  });

  const edgesAround = (
    start: string,
    end: string,
    planet: string,
  ): [string, string][] =>
    service
      .findEdgeEvents(
        { end: moment.utc(end), start: moment.utc(start) },
        philadelphia as Input,
      )
      .filter((event: DetectedCalendarEvent) => event.tags.includes(planet))
      .map((event) => [
        event.tags.at(-1) ?? "",
        event.start.format("YYYY-MM-DD"),
      ]);

  it("finds Venus's rise, greatest elongation and set around a window in its 2026 evening apparition", () => {
    const edges = edgesAround(
      "2026-04-10T00:00:00Z",
      "2026-04-11T00:00:00Z",
      "Venusian",
    );

    expect(new Set(edges.map(([name]) => name))).toStrictEqual(
      new Set(["Eastern Elongation", "Evening Rise", "Evening Set"]),
    );
    expect(edges).toContainEqual(["Evening Rise", "2026-01-31"]);
    expect(edges).toContainEqual(["Eastern Elongation", "2026-08-15"]);
    expect(edges).toContainEqual(["Evening Set", "2026-10-20"]);
  });

  it("finds Mercury's rise, greatest elongation and set around a window in its early 2026 evening apparition", () => {
    const edges = edgesAround(
      "2026-02-25T00:00:00Z",
      "2026-02-26T00:00:00Z",
      "Mercurian",
    );

    expect(edges).toContainEqual(["Evening Rise", "2026-01-30"]);
    expect(edges).toContainEqual(["Eastern Elongation", "2026-02-19"]);
    expect(edges).toContainEqual(["Evening Set", "2026-03-04"]);
  });

  // Mars was at opposition on 16 January 2025, rose into the morning sky in
  // mid-2024 and set into the evening glare in mid-2025.
  it("finds Mars's rise, opposition and set around a window in its 2025 apparition", () => {
    const edges = edgesAround(
      "2024-12-01T00:00:00Z",
      "2024-12-02T00:00:00Z",
      "Martian",
    );

    expect(edges.map(([name]) => name).toSorted()).toStrictEqual([
      "Morning Rise",
      "Opposition",
    ]);
    expect(edges).toContainEqual(["Opposition", "2025-01-16"]);
  });

  it("finds Mars's opposition before, and its set after, a window past opposition", () => {
    const edges = edgesAround(
      "2025-03-01T00:00:00Z",
      "2025-03-02T00:00:00Z",
      "Martian",
    );

    expect(edges.map(([name]) => name).toSorted()).toStrictEqual([
      "Evening Set",
      "Opposition",
    ]);
    expect(edges).toContainEqual(["Opposition", "2025-01-16"]);
  });

  it("finds the set before and the rise after a window with the planet lost in the Sun's glare", () => {
    const edges = edgesAround(
      "2026-03-06T00:00:00Z",
      "2026-03-07T00:00:00Z",
      "Mercurian",
    );

    expect(edges).toContainEqual(["Evening Set", "2026-03-04"]);
    expect(edges).toContainEqual(["Morning Rise", "2026-03-10"]);
  });
});
