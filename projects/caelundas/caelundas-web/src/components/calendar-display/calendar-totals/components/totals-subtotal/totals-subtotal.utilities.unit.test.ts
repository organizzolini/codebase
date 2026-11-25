import { describe, expect, it } from "vitest";

import { readRowFigures } from "./totals-subtotal.utilities";

import type { MetricGroup } from "../../../calendar-metrics/calendar-metrics.types";

const GROUP: MetricGroup = {
  id: "/0:alpha",
  key: "alpha",
  label: "Alpha",
  level: 0,
  orderKey: "alpha",
  path: null,
  values: [
    { metric: "EVENTS", previous: 4, value: 6 },
    { metric: "FIRST_START", previous: null, value: 1000 },
  ],
};

describe(readRowFigures, () => {
  it("reads a group's value, previous and share of the whole", () => {
    expect(readRowFigures(GROUP, "EVENTS", 12)).toStrictEqual({
      previous: 4,
      share: 50,
      value: 6,
    });
  });

  it("gives no share for a metric that does not add up", () => {
    expect(readRowFigures(GROUP, "FIRST_START", 1000).share).toBeNull();
  });

  it("reads a metric the group lacks as unknown", () => {
    expect(readRowFigures(GROUP, "SPANS", 12)).toStrictEqual({
      previous: null,
      share: null,
      value: null,
    });
  });
});
