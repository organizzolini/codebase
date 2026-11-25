import { describe, expect, it, vi } from "vitest";

import {
  applyLayoutLeaf,
  createLayoutItems,
  isLayoutChoice,
  toForcedBranches,
  toLayoutValue,
  toOpenBranches,
} from "./calendar-layout-menu.utilities";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";

/**
 * Applies a leaf from a view, returning the handlers it called.
 */
function apply(
  leaf: string,
  view: CalendarViewName = "timeline",
): UseCalendarDisplayResult["handlers"] {
  const handlers: UseCalendarDisplayResult["handlers"] = {
    handleClustersChange: vi.fn<(enabled: boolean) => void>(),
    handleColorsChange: vi.fn<(enabled: boolean) => void>(),
    handleCompareChange: vi.fn<(enabled: boolean) => void>(),
    handleScaleChange: vi.fn<() => void>(),
    handleSymbolsChange: vi.fn<() => void>(),
    handleViewChange: vi.fn<() => void>(),
  };

  applyLayoutLeaf(leaf, { handlers, view });

  return handlers;
}

describe("calendar-layout-menu utilities", () => {
  describe(createLayoutItems, () => {
    it("lists the layouts as radios, Charts and Totals after Table", () => {
      const items = createLayoutItems();

      expect(items.every((item) => item.radio)).toBe(true);
      expect(items.map((item) => item.label)).toStrictEqual([
        "Month",
        "Week",
        "Day",
        "Table",
        "Charts",
        "Totals",
        "Timeline",
      ]);
      expect(items.map((item) => item.value)).toStrictEqual([
        "calendar:month",
        "calendar:week",
        "calendar:day",
        "calendar:table",
        "calendar:charts",
        "calendar:totals",
        "calendar:timeline",
      ]);
    });

    it("describes and draws an icon on every row", () => {
      const items = createLayoutItems();
      const rows = [...items, ...items.flatMap((item) => item.children ?? [])];

      for (const row of rows) {
        expect(row.description).toBeDefined();
        expect(row.icon).toBeDefined();
      }
    });

    it("nests the scales as radios beneath the Timeline layout only", () => {
      const items = createLayoutItems();
      const timeline = items.find((item) => item.value === "calendar:timeline");

      expect(timeline?.children?.map((item) => item.value)).toStrictEqual([
        "scale:day",
        "scale:week",
        "scale:month",
        "scale:quarter",
        "scale:year",
      ]);
      expect(timeline?.children?.every((item) => item.radio)).toBe(true);
      expect(items.filter((item) => item.children !== undefined)).toHaveLength(
        1,
      );
    });
  });

  describe(isLayoutChoice, () => {
    it("lets every row be picked, the timeline's branch too", () => {
      expect(isLayoutChoice()).toBe(true);
    });
  });

  describe(toLayoutValue, () => {
    it("ticks the layout, with the scale only on the timeline", () => {
      expect(toLayoutValue("timeline", "month")).toStrictEqual([
        "calendar:timeline",
        "scale:month",
      ]);
      expect(toLayoutValue("table", "month")).toStrictEqual(["calendar:table"]);
    });
  });

  describe(toForcedBranches, () => {
    it("forces the timeline open only while it is the layout", () => {
      expect(toForcedBranches("timeline")).toStrictEqual(["calendar:timeline"]);
      expect(toForcedBranches("table")).toStrictEqual([]);
      expect(toForcedBranches("month")).toStrictEqual([]);
    });
  });

  describe(toOpenBranches, () => {
    it("adds the forced branch to the ones the user opened, once", () => {
      expect(toOpenBranches(["branch:x"], "timeline")).toStrictEqual([
        "branch:x",
        "calendar:timeline",
      ]);
      expect(toOpenBranches(["calendar:timeline"], "timeline")).toStrictEqual([
        "calendar:timeline",
      ]);
    });

    it("leaves the user's branches alone under another layout", () => {
      expect(toOpenBranches(["branch:x"], "table")).toStrictEqual(["branch:x"]);
    });
  });

  describe(applyLayoutLeaf, () => {
    it("sets the calendar view, and ignores one it does not know", () => {
      expect(apply("calendar:week").handleViewChange).toHaveBeenCalledWith(
        "week",
      );
      expect(apply("calendar:narnia").handleViewChange).not.toHaveBeenCalled();
    });

    it("sets the scale", () => {
      expect(apply("scale:year").handleScaleChange).toHaveBeenCalledWith(
        "year",
      );
    });

    it("switches to the timeline when a scale is picked from another layout", () => {
      const handlers = apply("scale:week", "table");

      expect(handlers.handleViewChange).toHaveBeenCalledWith("timeline");
      expect(handlers.handleScaleChange).toHaveBeenCalledWith("week");
      expect(apply("scale:week").handleViewChange).not.toHaveBeenCalled();
    });

    it("ignores a scale it does not know, and a leaf that is neither", () => {
      expect(apply("scale:narnia").handleScaleChange).not.toHaveBeenCalled();
      expect(apply("colors").handleViewChange).not.toHaveBeenCalled();
    });
  });
});
