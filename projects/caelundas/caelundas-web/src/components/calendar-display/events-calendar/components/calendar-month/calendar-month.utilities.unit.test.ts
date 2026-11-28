import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../testing/calendar/calendar-records";

import { getMonthGrid, indexMonthEvents } from "./calendar-month.utilities";

const MARCH = new Date("2026-03-10T12:00:00Z");

describe("the month's utilities", () => {
  describe(getMonthGrid, () => {
    it("draws whole weeks from the Sunday on or before the first to the Saturday on or after the last", () => {
      const grid = getMonthGrid(MARCH);

      expect(grid.firstDay).toBe("2026-03-01");
      expect(grid.lastDay).toBe("2026-03-31");
      expect(grid.weeks).toHaveLength(5);
      expect(grid.weeks[0]?.[0]).toBe("2026-03-01");
      expect(grid.weeks.at(-1)?.at(-1)).toBe("2026-04-04");
    });

    it("starts before the first when the month does not begin on a Sunday", () => {
      const grid = getMonthGrid(new Date("2026-04-10T12:00:00Z"));

      expect(grid.weeks[0]?.[0]).toBe("2026-03-29");
    });
  });

  describe(indexMonthEvents, () => {
    const grid = getMonthGrid(MARCH);

    it("files an event under every day it runs through", () => {
      const { byDay } = indexMonthEvents(
        [createRecord("a", "2026-03-10T08:00:00Z", "2026-03-12T08:00:00Z")],
        grid,
        "UTC",
      );

      expect([...byDay.keys()]).toStrictEqual([
        "2026-03-10",
        "2026-03-11",
        "2026-03-12",
      ]);
    });

    it("does not reach into the day an event ends at midnight", () => {
      const { byDay } = indexMonthEvents(
        [createRecord("a", "2026-03-10T08:00:00Z", "2026-03-11T00:00:00Z")],
        grid,
        "UTC",
      );

      expect([...byDay.keys()]).toStrictEqual(["2026-03-10"]);
    });

    it("keeps an event to the days the grid draws", () => {
      const { byDay } = indexMonthEvents(
        [createRecord("a", "2026-02-20T00:00:00Z", "2026-03-02T12:00:00Z")],
        grid,
        "UTC",
      );

      expect([...byDay.keys()]).toStrictEqual(["2026-03-01", "2026-03-02"]);
    });

    it("sets apart the events that run through every day of the month", () => {
      const whole = createRecord(
        "whole",
        "2026-02-01T00:00:00Z",
        "2026-05-01T00:00:00Z",
      );
      const { allMonth, byDay } = indexMonthEvents(
        [whole, createRecord("a", "2026-03-10T08:00:00Z")],
        grid,
        "UTC",
      );

      expect(allMonth).toStrictEqual([whole]);
      expect([...byDay.keys()]).toStrictEqual(["2026-03-10"]);
    });

    it("files nothing for a grid with no days", () => {
      expect(
        indexMonthEvents(
          [createRecord("a", "2026-03-10T08:00:00Z")],
          { firstDay: "", lastDay: "", weeks: [] },
          "UTC",
        ),
      ).toStrictEqual({ allMonth: [], byDay: new Map() });
    });
  });
});
