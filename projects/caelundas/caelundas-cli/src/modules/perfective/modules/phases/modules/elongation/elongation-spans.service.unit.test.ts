import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ProgressiveUtilitiesService } from "../../../../../progressive/progressive-utilities.service";

import { ElongationSpansService } from "./elongation-spans.service";

import type { DetectedCalendarEvent } from "../../../../../calendar-events/calendar-events.types";

const point = (
  marker: string,
  name: string,
  iso: string,
): DetectedCalendarEvent => ({
  description: name,
  end: moment.utc(iso),
  start: moment.utc(iso),
  summary: name,
  tags: ["Astronomy", "Astrology", "Planetary Phase", marker, name],
});

const service = new ElongationSpansService(
  new LoggerService(),
  new ProgressiveUtilitiesService(new LoggerService()),
);

describe(ElongationSpansService, () => {
  it("widens from rise to greatest elongation, then closes to set, for an evening apparition", () => {
    const spans = service.detectProgressive([
      point("Venusian", "Evening Rise", "2026-01-31T18:43:00Z"),
      point("Venusian", "Eastern Elongation", "2026-08-15T06:32:00Z"),
      point("Venusian", "Evening Set", "2026-10-20T09:30:00Z"),
    ]);

    expect(
      spans.map((span) => [
        span.summary,
        span.start.toISOString(),
        span.end.toISOString(),
      ]),
    ).toStrictEqual([
      [
        "♀️🌇 Venus Evening Star Widening",
        "2026-01-31T18:43:00.000Z",
        "2026-08-15T06:32:00.000Z",
      ],
      [
        "♀️🌇 Venus Evening Star Closing",
        "2026-08-15T06:32:00.000Z",
        "2026-10-20T09:30:00.000Z",
      ],
    ]);
  });

  it("describes and tags a morning half by the planet, the side and the stage", () => {
    const [span] = service.detectProgressive([
      point("Mercurian", "Morning Rise", "2026-03-10T11:02:00Z"),
      point("Mercurian", "Western Elongation", "2026-04-03T22:34:00Z"),
    ]);

    expect(span?.description).toBe(
      "Mercury Morning Star Widening (Morning Rise to Western Elongation)",
    );
    expect(span?.tags).toStrictEqual([
      "Astronomy",
      "Astrology",
      "Planetary Phase",
      "Mercurian",
      "Morning Widening",
    ]);
  });

  it("keeps each planet's points apart", () => {
    expect(
      service.detectProgressive([
        point("Venusian", "Evening Rise", "2026-01-31T00:00:00Z"),
        point("Mercurian", "Eastern Elongation", "2026-02-19T00:00:00Z"),
      ]),
    ).toStrictEqual([]);
  });

  it("widens Mars from its morning rise to opposition, then closes it to its evening set", () => {
    const spans = service.detectProgressive([
      point("Martian", "Morning Rise", "2025-07-01T00:00:00Z"),
      point("Martian", "Opposition", "2026-01-16T00:00:00Z"),
      point("Martian", "Evening Set", "2026-08-01T00:00:00Z"),
    ]);

    expect(
      spans.map((span) => [
        span.summary,
        span.start.toISOString(),
        span.end.toISOString(),
        span.tags.at(-1),
      ]),
    ).toStrictEqual([
      [
        "♂️🌄 Mars Morning Star Widening",
        "2025-07-01T00:00:00.000Z",
        "2026-01-16T00:00:00.000Z",
        "Morning Widening",
      ],
      [
        "♂️🌇 Mars Evening Star Closing",
        "2026-01-16T00:00:00.000Z",
        "2026-08-01T00:00:00.000Z",
        "Evening Closing",
      ],
    ]);
  });

  it("makes no Mars span from a rise and a set with no opposition between", () => {
    expect(
      service.detectProgressive([
        point("Martian", "Morning Rise", "2026-02-03T00:00:00Z"),
        point("Martian", "Morning Set", "2026-06-03T00:00:00Z"),
      ]),
    ).toStrictEqual([]);
  });
});
