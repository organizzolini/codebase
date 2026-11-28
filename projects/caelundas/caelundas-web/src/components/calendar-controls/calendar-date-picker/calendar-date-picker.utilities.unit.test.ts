import { describe, expect, it } from "vitest";

import {
  countRangeDays,
  formatGridCursor,
  formatMonthCursor,
  formatRange,
  formatWeekLabel,
  getGridCursor,
  getLayoutHint,
  getMonthCursor,
  getPeriod,
  getPickerRange,
  isGridMode,
  listOfferedModes,
  listPeriodCells,
  listWeekCells,
  resolveMode,
  shiftGridCursor,
  shiftMonthCursor,
  toLocalDate,
  toLocalDay,
  toWindowSearch,
} from "./calendar-date-picker.utilities";

// A Tuesday, so weeks, months and quarters all start before it.
const TODAY = "2026-11-24";
const ANCHOR = new Date(Date.UTC(2026, 10, 24, 12));

describe("calendar date picker utilities", () => {
  describe("periods and grids", () => {
    it("picks the span of each mode that holds a day", () => {
      expect(getPeriod("week", "2026-11-28")).toStrictEqual({
        from: "2026-11-22",
        to: "2026-11-28",
      });
      expect(getPeriod("month", "2026-02-10")).toStrictEqual({
        from: "2026-02-01",
        to: "2026-02-28",
      });
      expect(getPeriod("quarter", "2026-05-05")).toStrictEqual({
        from: "2026-04-01",
        to: "2026-06-30",
      });
      expect(getPeriod("half-year", "2026-05-05")).toStrictEqual({
        from: "2026-01-01",
        to: "2026-06-30",
      });
      expect(getPeriod("year", "2026-05-05")).toStrictEqual({
        from: "2026-01-01",
        to: "2026-12-31",
      });
    });

    it("crosses a year when it shifts a span", () => {
      expect(getPeriod("month", "2026-12-15", 1)).toStrictEqual({
        from: "2027-01-01",
        to: "2027-01-31",
      });
      expect(getPeriod("quarter", "2026-02-15", -1)).toStrictEqual({
        from: "2025-10-01",
        to: "2025-12-31",
      });
    });

    it("lists twelve months, four quarters, two half-years or twelve years", () => {
      const months = listPeriodCells("month", 2026);

      expect(months).toHaveLength(12);
      expect(months[1]).toStrictEqual({
        label: "Feb",
        range: { from: "2026-02-01", to: "2026-02-28" },
      });
      expect(
        listPeriodCells("quarter", 2026).map((cell) => cell.label),
      ).toStrictEqual(["Q1", "Q2", "Q3", "Q4"]);
      expect(listPeriodCells("half-year", 2026)[1]?.range).toStrictEqual({
        from: "2026-07-01",
        to: "2026-12-31",
      });

      const years = listPeriodCells("year", 2016);

      expect(years).toHaveLength(12);
      expect(years[0]?.label).toBe("2016");
      expect(years[11]?.range.to).toBe("2027-12-31");
    });

    it("opens a grid on the range's year, or the twelve years holding it", () => {
      const range = { from: "2026-11-01", to: "2026-11-30" };

      expect(getGridCursor("month", range)).toBe(2026);
      expect(getGridCursor("year", range)).toBe(2016);
      expect(formatGridCursor("month", 2026)).toBe("2026");
      expect(formatGridCursor("year", 2016)).toBe("2016 – 2027");
      expect(shiftGridCursor("month", 2026, 1)).toBe(2027);
      expect(shiftGridCursor("year", 2016, -1)).toBe(2004);
    });

    it("tells grid modes from day modes", () => {
      expect(isGridMode("month")).toBe(true);
      expect(isGridMode("week")).toBe(false);
      expect(isGridMode("day")).toBe(false);
    });
  });

  describe("ranges as text and dates", () => {
    it("writes one day alone and many with a dash", () => {
      expect(formatRange({ from: TODAY, to: TODAY })).toBe(TODAY);
      expect(formatRange({ from: TODAY, to: "2026-12-23" })).toBe(
        "2026-11-24 – 2026-12-23",
      );
    });

    it("counts both ends", () => {
      expect(countRangeDays({ from: TODAY, to: TODAY })).toBe(1);
      expect(countRangeDays({ from: "2026-01-01", to: "2026-12-31" })).toBe(
        365,
      );
    });

    it("reads days as local dates and back", () => {
      expect(toLocalDay(toLocalDate("2026-03-01"))).toBe("2026-03-01");
      expect(toLocalDate("2026-03-01").getMonth()).toBe(2);
    });
  });

  describe("the days a view shows", () => {
    it("opens on the days each view shows now", () => {
      expect(getPickerRange("table", ANCHOR, { agendaDays: 30 })).toStrictEqual(
        {
          from: TODAY,
          to: "2026-12-23",
        },
      );
      expect(getPickerRange("month", ANCHOR, {})).toStrictEqual({
        from: "2026-11-01",
        to: "2026-11-30",
      });
      expect(getPickerRange("week", ANCHOR, {})).toStrictEqual({
        from: "2026-11-22",
        to: "2026-11-28",
      });
      expect(getPickerRange("day", ANCHOR, {})).toStrictEqual({
        from: TODAY,
        to: TODAY,
      });
      expect(
        getPickerRange("timeline", ANCHOR, { scale: "week" }),
      ).toStrictEqual({ from: "2026-11-22", to: "2026-11-28" });
    });
  });

  describe("the link's window for a range", () => {
    const november = { from: "2026-11-01", to: "2026-11-30" };

    it("gives the table the first day and the days it lists", () => {
      expect(toWindowSearch("table", november)).toStrictEqual({
        date: "2026-11-01",
        days: 30,
      });
    });

    it("gives the Charts and Totals the table's window", () => {
      expect(toWindowSearch("charts", november)).toStrictEqual({
        date: "2026-11-01",
        days: 30,
      });
      expect(toWindowSearch("totals", november)).toStrictEqual({
        date: "2026-11-01",
        days: 30,
      });
    });

    it("caps the table at a year and a day", () => {
      expect(
        toWindowSearch("table", { from: "2026-01-01", to: "2030-01-01" }).days,
      ).toBe(366);
    });

    it("gives the timeline the smallest scale that fits the range", () => {
      expect(toWindowSearch("timeline", { from: TODAY, to: TODAY }).scale).toBe(
        "day",
      );
      expect(
        toWindowSearch("timeline", { from: "2026-11-22", to: "2026-11-28" })
          .scale,
      ).toBe("week");
      expect(toWindowSearch("timeline", november).scale).toBe("month");
      expect(
        toWindowSearch("timeline", { from: "2026-10-01", to: "2026-12-31" })
          .scale,
      ).toBe("quarter");
      expect(
        toWindowSearch("timeline", { from: "2026-01-01", to: "2026-06-30" })
          .scale,
      ).toBe("year");
    });

    it("opens the other views on the first day alone", () => {
      expect(toWindowSearch("month", november)).toStrictEqual({
        date: "2026-11-01",
      });
      expect(toWindowSearch("week", november)).toStrictEqual({
        date: "2026-11-01",
      });
      expect(toWindowSearch("day", november)).toStrictEqual({
        date: "2026-11-01",
      });
    });
  });

  describe("layout rule", () => {
    it("offers every mode to the day, table and timeline layouts", () => {
      const all = ["day", "week", "month", "quarter", "half-year", "year"];

      expect(listOfferedModes("day")).toStrictEqual(all);
      expect(listOfferedModes("table")).toStrictEqual(all);
      expect(listOfferedModes("charts")).toStrictEqual(all);
      expect(listOfferedModes("totals")).toStrictEqual(all);
      expect(listOfferedModes("timeline")).toStrictEqual(all);
    });

    it("drops the modes finer than the week and month layouts", () => {
      expect(listOfferedModes("week")).toStrictEqual([
        "week",
        "month",
        "quarter",
        "half-year",
        "year",
      ]);
      expect(listOfferedModes("month")).toStrictEqual([
        "month",
        "quarter",
        "half-year",
        "year",
      ]);
    });

    it("falls back to the smallest offered mode", () => {
      expect(resolveMode("day", "month")).toBe("month");
      expect(resolveMode("day", "week")).toBe("week");
      expect(resolveMode("quarter", "month")).toBe("quarter");
      expect(resolveMode("day", "table")).toBe("day");
    });

    it("says a layout shows the unit of the start of a longer span", () => {
      expect(getLayoutHint("month", "quarter")).toBe(
        "The month view shows the month of the start.",
      );
      expect(getLayoutHint("week", "month")).toBe(
        "The week view shows the week of the start.",
      );
      expect(getLayoutHint("month", "month")).toBeUndefined();
      expect(getLayoutHint("table", "year")).toBeUndefined();
    });
  });

  describe("week chips", () => {
    it("labels a week as a compact range", () => {
      expect(formatWeekLabel({ from: "2026-11-22", to: "2026-11-28" })).toBe(
        "Nov 22 – 28",
      );
      expect(formatWeekLabel({ from: "2026-11-29", to: "2026-12-05" })).toBe(
        "Nov 29 – Dec 5",
      );
    });

    it("lists every week touching the month, Sunday to Saturday", () => {
      const labels = listWeekCells("2026-11-01").map((cell) => cell.label);

      expect(labels).toStrictEqual([
        "Nov 1 – 7",
        "Nov 8 – 14",
        "Nov 15 – 21",
        "Nov 22 – 28",
        "Nov 29 – Dec 5",
      ]);
      expect(listWeekCells("2026-08-01")[0]?.label).toBe("Jul 26 – Aug 1");
    });

    it("names and moves the month cursor", () => {
      expect(formatMonthCursor("2026-11-01")).toBe("Nov 2026");
      expect(getMonthCursor({ from: "2026-11-29", to: "2026-12-05" })).toBe(
        "2026-11-01",
      );
      expect(shiftMonthCursor("2026-12-01", 1)).toBe("2027-01-01");
      expect(shiftMonthCursor("2026-01-01", -1)).toBe("2025-12-01");
    });
  });
});
