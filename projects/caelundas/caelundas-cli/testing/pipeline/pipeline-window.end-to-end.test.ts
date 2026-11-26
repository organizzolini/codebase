import { describe, expect, it } from "vitest";

import {
  ingressBodies,
  retrogradeBodies,
} from "../../src/modules/caelundas/caelundas.constants";
import { bodyDisplayName } from "../../src/modules/caelundas/caelundas.types";

import { PIPELINE_TEST_TIMEOUT_MILLISECONDS } from "./pipeline-window.constants";
import { runPipelineWindow } from "./pipeline-window.functions";

import type { DetectedCalendarEvent } from "../../src/modules/calendar-events/calendar-events.types";

const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };
const equinoxDay = {
  ...philadelphia,
  endDate: "2026-03-21",
  startDate: "2026-03-20",
};

describe(
  runPipelineWindow,
  { timeout: PIPELINE_TEST_TIMEOUT_MILLISECONDS },
  () => {
    it("detects perfective events and derives progressive ones from them", async () => {
      expect.hasAssertions();

      const window = await runPipelineWindow(equinoxDay);

      expect(window.perfective.length).toBeGreaterThan(0);
      expect(window.progressive.length).toBeGreaterThan(0);
      expect(window.events).toHaveLength(
        window.perfective.length + window.progressive.length,
      );
      expect(window.input.timezone).toBe("America/New_York");
    });

    it("stores every span, and leaves out the instants a span starts or ends on", async () => {
      expect.hasAssertions();

      const { perfective, progressive, stored } =
        await runPipelineWindow(equinoxDay);
      const has = (event: DetectedCalendarEvent, tag: string): boolean =>
        event.tags.includes(tag);
      const storedInstants = stored.filter((event) =>
        event.start.isSame(event.end),
      );

      expect(
        stored.filter((event) => !event.start.isSame(event.end)),
      ).toHaveLength(progressive.length);
      // The twilights, the equinox and the ingresses are all span boundaries.
      expect(perfective.some((event) => has(event, "Twilight"))).toBe(true);
      expect(storedInstants.some((event) => has(event, "Twilight"))).toBe(
        false,
      );
      expect(storedInstants.some((event) => has(event, "Ingress"))).toBe(false);
      expect(storedInstants.some((event) => has(event, "Forming"))).toBe(false);
      expect(storedInstants.some((event) => has(event, "Dissolving"))).toBe(
        false,
      );
      // Sunrise, solar noon and the exact aspects bound no span, so they stay.
      expect(storedInstants.some((event) => has(event, "Sunrise"))).toBe(true);
      expect(storedInstants.some((event) => has(event, "Solar Zenith"))).toBe(
        true,
      );
      expect(storedInstants.some((event) => has(event, "Perfective"))).toBe(
        true,
      );
    });

    it("returns every event sorted by start time", async () => {
      expect.hasAssertions();

      const { events } = await runPipelineWindow(equinoxDay);
      const starts = events.map((event) => event.start.valueOf());

      expect(starts).toStrictEqual(starts.toSorted((a, b) => a - b));
    });

    it.each([
      [
        "sign",
        (event: DetectedCalendarEvent) =>
          !event.tags.includes("Decan") && !event.tags.includes("Peak"),
      ],
      ["decan", (event: DetectedCalendarEvent) => event.tags.includes("Decan")],
      ["peak", (event: DetectedCalendarEvent) => event.tags.includes("Peak")],
    ])(
      "keeps every ingress body in a %s through the whole window, stay after stay",
      async (_kind, isKind) => {
        expect.hasAssertions();

        const { events, input } = await runPipelineWindow(equinoxDay);
        const windowStart = input.start
          .clone()
          .tz(input.timezone)
          .startOf("day");
        const windowEnd = input.end.clone().tz(input.timezone).endOf("day");

        for (const body of ingressBodies) {
          const stays = events
            .filter(
              (event) =>
                event.tags.includes("Ingress") &&
                event.tags.includes(bodyDisplayName(body)) &&
                !event.start.isSame(event.end) &&
                isKind(event),
            )
            .toSorted((first, second) => first.start.diff(second.start));

          expect(stays[0]?.start.isSameOrBefore(windowStart)).toBe(true);
          expect(stays.at(-1)?.end.isAfter(windowEnd)).toBe(true);
          expect(
            stays.slice(1).map((_stay, index) => stays[index]?.end.valueOf()),
          ).toStrictEqual(stays.slice(1).map((stay) => stay.start.valueOf()));
        }
      },
    );

    it("keeps every retrograde body either retrograde or direct through the whole window", async () => {
      expect.hasAssertions();

      const { events, input } = await runPipelineWindow(equinoxDay);
      const windowStart = input.start.clone().tz(input.timezone).startOf("day");
      const windowEnd = input.end.clone().tz(input.timezone).endOf("day");

      for (const body of retrogradeBodies) {
        const periods = events
          .filter(
            (event) =>
              (event.tags.includes("Retrogrades") ||
                event.tags.includes("Directs")) &&
              event.tags.includes(bodyDisplayName(body)),
          )
          .toSorted((first, second) => first.start.diff(second.start));

        expect(periods[0]?.start.isSameOrBefore(windowStart)).toBe(true);
        expect(periods.at(-1)?.end.isAfter(windowEnd)).toBe(true);
        expect(
          periods
            .slice(1)
            .map((_period, index) => periods[index]?.end.valueOf()),
        ).toStrictEqual(
          periods.slice(1).map((period) => period.start.valueOf()),
        );
      }
    });

    it("spans an aspect that is in orb through the whole window, though it forms and dissolves outside it", async () => {
      expect.hasAssertions();

      const { events, input } = await runPipelineWindow(equinoxDay);
      const windowStart = input.start.clone().tz(input.timezone).startOf("day");
      const windowEnd = input.end.clone().tz(input.timezone).endOf("day");
      const spans = events.filter(
        (event) =>
          event.tags.includes("Simple Aspect") &&
          event.tags.includes("Saturn") &&
          event.tags.includes("Neptune") &&
          event.tags.includes("Conjunct") &&
          !event.start.isSame(event.end),
      );

      expect(spans).toHaveLength(1);
      expect(spans[0]?.start.isBefore(windowStart)).toBe(true);
      expect(spans[0]?.end.isAfter(windowEnd)).toBe(true);
    });

    it("pairs every simple aspect boundary the window detects with a span", async () => {
      expect.hasAssertions();

      const { perfective, progressive } = await runPipelineWindow(equinoxDay);
      const sameAspect = (
        first: DetectedCalendarEvent,
        second: DetectedCalendarEvent,
      ): boolean =>
        first.tags.toSorted().join(",") ===
        second.tags
          .filter((tag) => tag !== "Forming" && tag !== "Dissolving")
          .toSorted()
          .join(",");
      const boundaries = perfective.filter(
        (event) =>
          event.tags.includes("Simple Aspect") &&
          (event.tags.includes("Forming") || event.tags.includes("Dissolving")),
      );
      const unpaired = boundaries.filter(
        (boundary) =>
          !progressive.some(
            (span) =>
              sameAspect(span, boundary) &&
              (boundary.tags.includes("Forming")
                ? span.start.isSame(boundary.start)
                : span.end.isSame(boundary.start)),
          ),
      );

      expect(boundaries.length).toBeGreaterThan(0);
      expect(unpaired.map((event) => event.summary)).toStrictEqual([]);
    });

    it.each([
      ["lunar phases", ["Monthly Lunar Cycle"], true, true],
      ["lunar apsides", ["Lunar Apsides"], true, true],
      ["winter", ["Annual Solar Cycle", "Winter"], true, false],
      ["spring", ["Annual Solar Cycle", "Spring"], false, true],
      ["the solar retreat", ["Annual Solar Cycle", "Retreating"], true, true],
      [
        "Venus's evening visibility",
        ["Venusian", "Evening Visibility"],
        true,
        true,
      ],
      [
        "Venus's evening widening",
        ["Venusian", "Evening Widening"],
        true,
        true,
      ],
      [
        "Mercury's morning visibility",
        ["Mercurian", "Morning Visibility"],
        true,
        true,
      ],
      [
        "Mercury's morning widening",
        ["Mercurian", "Morning Widening"],
        true,
        true,
      ],
    ])(
      "completes the span of %s the window opens or closes in, to its true start and end",
      async (_family, tags, atStart, atEnd) => {
        expect.hasAssertions();

        const { events, input } = await runPipelineWindow(equinoxDay);
        const windowStart = input.start
          .clone()
          .tz(input.timezone)
          .startOf("day");
        const windowEnd = input.end.clone().tz(input.timezone).endOf("day");
        const spans = events.filter(
          (event) =>
            !event.start.isSame(event.end) &&
            tags.every((tag) => event.tags.includes(tag)),
        );

        expect(spans.every((span) => span.end.isAfter(span.start))).toBe(true);
        expect(
          spans.some(
            (span) =>
              span.start.isBefore(windowStart) && span.end.isAfter(windowStart),
          ),
        ).toBe(atStart);
        expect(
          spans.some(
            (span) =>
              span.start.isBefore(windowEnd) && span.end.isAfter(windowEnd),
          ),
        ).toBe(atEnd);
      },
    );

    it("covers every minute of the window with a twilight, daylight or night span", async () => {
      expect.hasAssertions();

      const { events, input } = await runPipelineWindow(equinoxDay);
      const windowStart = input.start.clone().tz(input.timezone).startOf("day");
      const windowEnd = input.end.clone().tz(input.timezone).endOf("day");
      const spans = events.filter(
        (event) =>
          !event.start.isSame(event.end) && event.tags.includes("Twilight"),
      );
      const covers = (minute: moment.Moment): boolean =>
        spans.some(
          (span) =>
            span.start.isSameOrBefore(minute) && span.end.isAfter(minute),
        );

      expect(covers(windowStart)).toBe(true);
      expect(covers(windowEnd)).toBe(true);
    });

    it("pairs every moonrise and moonset in the window with a span the Moon is up", async () => {
      expect.hasAssertions();

      const { events } = await runPipelineWindow(equinoxDay);
      const crossings = events.filter(
        (event) =>
          event.start.isSame(event.end) &&
          (event.tags.includes("Moonrise") || event.tags.includes("Moonset")),
      );
      const spans = events.filter((event) => event.tags.includes("Moon Up"));
      const unpaired = crossings.filter(
        (crossing) =>
          !spans.some((span) =>
            crossing.tags.includes("Moonrise")
              ? span.start.isSame(crossing.start)
              : span.end.isSame(crossing.start),
          ),
      );

      expect(crossings.length).toBeGreaterThan(0);
      expect(unpaired.map((event) => event.summary)).toStrictEqual([]);
    });

    it("splits the Sun's year at its sixteen points into pre- and post- intervals that meet", async () => {
      expect.hasAssertions();

      const { events, input } = await runPipelineWindow(equinoxDay);
      const windowEnd = input.end.clone().tz(input.timezone).endOf("day");
      const intervals = events
        .filter(
          (event) =>
            event.tags.includes("Annual Solar Cycle") &&
            /^(?:Pre|Post)-/u.test(event.tags.at(4) ?? ""),
        )
        .toSorted((first, second) => first.start.diff(second.start));

      expect(intervals.map((interval) => interval.tags.at(4))).toContain(
        "Post-Vernal Equinox",
      );
      expect(intervals.at(-1)?.end.isAfter(windowEnd)).toBe(true);
      expect(
        intervals
          .slice(1)
          .map((_interval, index) => intervals[index]?.end.valueOf()),
      ).toStrictEqual(
        intervals.slice(1).map((interval) => interval.start.valueOf()),
      );
    });

    it("reuses a window it has already swept", async () => {
      expect.hasAssertions();

      await expect(runPipelineWindow(equinoxDay)).resolves.toBe(
        await runPipelineWindow({ ...equinoxDay }),
      );
    });
  },
);
