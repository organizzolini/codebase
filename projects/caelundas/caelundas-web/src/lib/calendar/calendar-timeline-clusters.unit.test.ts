import { describe, expect, it } from "vitest";

import {
  clusterTimelineBars,
  getClusterSpan,
} from "./calendar-timeline-clusters";

import type { TimelineBar } from "./calendar-timeline";
import type { GanttEvent } from "@codebase/presentation";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const START = Date.parse("2026-03-04T00:00:00.000Z");

/**
 * A bar in a row from a number of minutes after the start, lasting a number
 * of minutes, carrying a stand-in record.
 */
function bar(row: string, minute: number, length = 0): GanttEvent<TimelineBar> {
  const id = `${row}-${String(minute)}`;
  const start = new Date(START + minute * MINUTE);
  const end = new Date(START + (minute + length) * MINUTE);

  return {
    data: {
      records: [
        {
          color: null,
          description: id,
          durationMinutes: length,
          end,
          groups: [],
          id,
          location: null,
          start,
          summary: id,
          tags: [],
          timezone: "UTC",
        },
      ],
    },
    end,
    id,
    resourceId: row,
    start,
    title: id,
  };
}

describe("timeline clusters", () => {
  describe(getClusterSpan, () => {
    it.each([
      { expected: 9 * MINUTE, scale: "day", zoom: 1 },
      { expected: 0.6 * MINUTE, scale: "day", zoom: 15 },
      { expected: 9 * HOUR, scale: "month", zoom: 1 },
      { expected: 4.5 * HOUR, scale: "month", zoom: 2 },
    ] as const)(
      "covers a marker's width at the $scale scale zoomed $zoom times",
      ({ expected, scale, zoom }) => {
        expect(getClusterSpan(scale, zoom)).toBeCloseTo(expected);
      },
    );

    it("widens from the day to the year", () => {
      const spans = (["day", "week", "month", "quarter", "year"] as const).map(
        (scale) => getClusterSpan(scale, 1),
      );

      expect(spans).toStrictEqual(
        spans.toSorted((left, right) => left - right),
      );
    });
  });

  describe(clusterTimelineBars, () => {
    it("draws thousands of overlapping markers as one count", () => {
      const crowded = Array.from({ length: 2000 }, (_, index) =>
        bar("aspect", index / 1000),
      );
      const [cluster, ...rest] = clusterTimelineBars(crowded, 9 * MINUTE);

      expect(rest).toHaveLength(0);
      expect(cluster?.title).toBe("2000 events");
      expect(cluster?.data?.records).toHaveLength(2000);
      expect(cluster?.end.getTime()).toBe(START + 9 * MINUTE);
    });

    it("keeps markers a marker's width apart", () => {
      const spread = [bar("aspect", 0), bar("aspect", 10), bar("aspect", 20)];

      expect(clusterTimelineBars(spread, 9 * MINUTE)).toStrictEqual(spread);
    });

    it("starts a new count a marker's width after the last began", () => {
      const runs = [0, 1, 2, 9, 10].map((minute) => bar("aspect", minute));

      expect(
        clusterTimelineBars(runs, 9 * MINUTE).map(({ title }) => title),
      ).toStrictEqual(["3 events", "2 events"]);
    });

    it("never clusters across rows", () => {
      const rows = [bar("mars", 0), bar("venus", 0)];

      expect(clusterTimelineBars(rows, 9 * MINUTE)).toHaveLength(2);
    });

    it("counts bars with no row or record together", () => {
      const at = new Date(START);
      const bare = [
        { end: at, id: "a", start: at, title: "a" },
        { end: at, id: "b", start: at, title: "b" },
      ];
      const [cluster] = clusterTimelineBars(bare, 9 * MINUTE);

      expect(cluster?.title).toBe("0 events");
      expect(cluster?.resourceId).toBeUndefined();
    });

    it("draws a span long enough to see as it is", () => {
      const retrograde = bar("retrograde", 0, 30 * 24 * 60);
      const ingress = bar("retrograde", 1);

      expect(
        clusterTimelineBars([retrograde, ingress], 9 * HOUR),
      ).toStrictEqual([retrograde, ingress]);
    });
  });
});
