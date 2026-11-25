import { describe, expect, it } from "vitest";

import { isMetricChoice, toMetricList } from "./metric-select-strip.utilities";

describe("metric-select-strip utilities", () => {
  describe(isMetricChoice, () => {
    it("lets a metric be ticked, and a branch only open", () => {
      expect(isMetricChoice({ label: "Events", value: "EVENTS" })).toBe(true);
      expect(isMetricChoice({ label: "Counts", value: "branch:counts" })).toBe(
        false,
      );
    });
  });

  describe(toMetricList, () => {
    it("keeps the ticked metrics in their place, and adds the new after them", () => {
      expect(
        toMetricList(["SPANS", "EVENTS", "INSTANTS"], ["EVENTS", "SPANS"]),
      ).toStrictEqual(["EVENTS", "SPANS", "INSTANTS"]);
    });

    it("drops a metric that was cleared", () => {
      expect(toMetricList(["SPANS"], ["EVENTS", "SPANS"])).toStrictEqual([
        "SPANS",
      ]);
    });

    it("keeps the last metric when it is cleared", () => {
      expect(toMetricList([], ["EVENTS"])).toStrictEqual(["EVENTS"]);
    });

    it("forgets a value that names no metric", () => {
      expect(toMetricList(["EVENTS", "STALE"], ["EVENTS"])).toStrictEqual([
        "EVENTS",
      ]);
    });
  });
});
