import { describe, expect, it } from "vitest";

import { toMetricList } from "./metric-select-strip.utilities";

describe("metric-select-strip utilities", () => {
  describe(toMetricList, () => {
    it("keeps the ticked metrics in their place, and adds the new after them", () => {
      expect(
        toMetricList(
          ["progressive-events", "events", "perfective-events"],
          ["events", "progressive-events"],
        ),
      ).toStrictEqual(["events", "progressive-events", "perfective-events"]);
    });

    it("drops a metric that was cleared", () => {
      expect(
        toMetricList(["progressive-events"], ["events", "progressive-events"]),
      ).toStrictEqual(["progressive-events"]);
    });

    it("keeps the last metric when it is cleared", () => {
      expect(toMetricList([], ["events"])).toStrictEqual(["events"]);
    });

    it("forgets a value that names no metric", () => {
      expect(toMetricList(["events", "STALE"], ["events"])).toStrictEqual([
        "events",
      ]);
    });
  });
});
