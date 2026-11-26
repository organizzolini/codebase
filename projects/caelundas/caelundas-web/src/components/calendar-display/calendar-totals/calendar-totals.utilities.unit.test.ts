import { describe, expect, it } from "vitest";

import { CATALOG } from "../../../../testing/metrics/metric-catalog";

import {
  findGroupColor,
  findGroupValue,
  getSharePercent,
  toTotalsCards,
} from "./calendar-totals.utilities";

import type {
  MetricGroup,
  MetricNode,
} from "../calendar-metrics/calendar-metrics.types";

function createGroup(id: string, key: null | string = id): MetricGroup {
  return {
    id,
    key,
    label: id,
    level: 0,
    path: null,
    rank: key,
    values: [],
  };
}

function createNode(
  id: string,
  ancestors: readonly MetricGroup[] = [],
  key: null | string = id,
): MetricNode {
  return { ancestors, group: createGroup(id, key), isExpandable: false };
}

describe("calendar totals utilities", () => {
  describe(findGroupColor, () => {
    const colors = new Map([["planet", "#ff0000"]]);

    it("gives none when colors are off", () => {
      expect(findGroupColor(createNode("planet"), undefined)).toBeUndefined();
    });

    it("gives a group's own color by its key", () => {
      expect(findGroupColor(createNode("planet"), colors)).toBe("#ff0000");
    });

    it("falls back to the nearest ancestor's color", () => {
      const node = createNode("mars", [createGroup("planet")]);

      expect(findGroupColor(node, colors)).toBe("#ff0000");
    });

    it("gives none for a group and ancestors with no color", () => {
      const node = createNode("mars", [createGroup("none", null)], null);

      expect(findGroupColor(node, colors)).toBeUndefined();
    });
  });

  describe(getSharePercent, () => {
    it("gives a share of the whole", () => {
      expect(getSharePercent(25, 100)).toBe(25);
    });

    it("clamps to the whole and to nothing", () => {
      expect(getSharePercent(150, 100)).toBe(100);
      expect(getSharePercent(-5, 100)).toBe(0);
    });

    it("gives none when either is unknown or the whole is nothing", () => {
      expect(getSharePercent(null, 100)).toBeNull();
      expect(getSharePercent(5, null)).toBeNull();
      expect(getSharePercent(5, 0)).toBeNull();
    });
  });

  describe(findGroupValue, () => {
    it("gives a group's value for a metric, or none when it lacks it", () => {
      const group: MetricGroup = {
        ...createGroup("a"),
        values: [{ metric: "events", previous: null, value: 7 }],
      };

      expect(findGroupValue(group, "events")).toBe(7);
      expect(findGroupValue(group, "progressive-events")).toBeNull();
    });
  });

  describe(toTotalsCards, () => {
    it("pairs each total with its metric, in order, leaving out one the catalog lacks", () => {
      const totals = [
        { metric: "progressive-events", previous: null, value: 2 },
        { metric: "unknown-slug", previous: null, value: 9 },
        { metric: "events", previous: 4, value: 5 },
      ];
      const cards = toTotalsCards(totals, CATALOG.bySlug);

      expect(cards.map((card) => card.metric.slug)).toStrictEqual([
        "progressive-events",
        "events",
      ]);
      expect(cards.map((card) => card.total.value)).toStrictEqual([2, 5]);
    });
  });
});
