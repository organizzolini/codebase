import { describe, expect, it } from "vitest";

import {
  getVisibleTimelineRows,
  isSameRowSet,
  windowTimelineBars,
} from "./calendar-timeline-window";

import type { TimelineBar } from "./calendar-timeline";
import type { GanttEvent } from "@codebase/presentation";

const ROWS = Array.from({ length: 500 }, (_, index) => ({
  height: 40,
  id: `row-${String(index)}`,
}));

/**
 * A bar with no record, in a row.
 */
function bar(row: string): GanttEvent<TimelineBar> {
  const at = new Date("2026-03-04T15:20:00.000Z");

  return { end: at, id: row, resourceId: row, start: at, title: row };
}

describe("timeline window", () => {
  describe(getVisibleTimelineRows, () => {
    it("keeps the rows on screen and a few beyond each edge", () => {
      const visible = getVisibleTimelineRows(ROWS, {
        scrollTop: 4000,
        viewportHeight: 400,
      });

      expect([...(visible ?? [])]).toStrictEqual(
        Array.from({ length: 26 }, (_, index) => `row-${String(92 + index)}`),
      );
    });

    it("counts every row as visible before the body is laid out", () => {
      expect(
        getVisibleTimelineRows(ROWS, { scrollTop: 0, viewportHeight: 0 }),
      ).toBeNull();
    });

    it("counts every row as visible when there are none", () => {
      expect(
        getVisibleTimelineRows([], { scrollTop: 0, viewportHeight: 400 }),
      ).toBeNull();
    });
  });

  describe(isSameRowSet, () => {
    it.each([
      { expected: true, left: null, right: null },
      { expected: false, left: null, right: new Set(["a"]) },
      { expected: true, left: new Set(["a", "b"]), right: new Set(["a", "b"]) },
      { expected: false, left: new Set(["a"]), right: new Set(["b"]) },
    ])("compares $left with $right", ({ expected, left, right }) => {
      expect(isSameRowSet(left, right)).toBe(expected);
    });
  });

  describe(windowTimelineBars, () => {
    it("hands bars only to the visible rows", () => {
      const bars = [bar("row-1"), bar("row-2"), bar("row-3")];

      expect(
        windowTimelineBars(bars, new Set(["row-2"])).map(({ id }) => id),
      ).toStrictEqual(["row-2"]);
      expect(windowTimelineBars(bars, null)).toBe(bars);
      expect(
        windowTimelineBars(
          [{ end: new Date(0), id: "loose", start: new Date(0), title: "" }],
          new Set(["row-1"]),
        ),
      ).toStrictEqual([]);
    });
  });
});
