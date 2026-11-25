import { describe, expect, it } from "vitest";

import { EventMetric } from "../inputs/event-metric.entities";

import { toMeasuredRows } from "./event-metrics-facts.utilities";

import type { FactsRow } from "./event-metrics-facts.types";

const MARS = "0199b1a0-0000-7000-8000-000000000001";
const MOON = "0199b1a0-0000-7000-8000-000000000003";

/** A row of the facts statement, its optional parts defaulted. */
function row(rest: Partial<FactsRow> & Pick<FactsRow, "level">): FactsRow {
  return { label: null, path: null, period: 0, rank: null, ...rest };
}

describe(toMeasuredRows, () => {
  const request = {
    levels: 2,
    measures: ["events", "tags"] as const,
    metrics: [EventMetric.EVENTS, EventMetric.UNIQUE_TAGS],
  };

  it("sorts the rows into the total and a list a level", () => {
    expect.hasAssertions();

    const { levels, total } = toMeasuredRows(
      [
        row({ level: -1, m_events: 5, tags: 3 }),
        row({ level: 0, m_events: 4, t0: MARS, tags: 2 }),
        row({ level: 1, m_events: 1, t0: MARS, t1: MOON, tags: 1 }),
        row({ level: 1, m_events: 2, t0: MARS, t1: null, tags: 2 }),
      ],
      request,
    );

    expect(total.map(({ values }) => values)).toStrictEqual([[5, 3]]);
    expect(levels).toHaveLength(2);
    expect(levels[0]?.map(({ values }) => values)).toStrictEqual([[4, 2]]);
    expect(levels[1]?.map(({ values }) => values)).toStrictEqual([
      [1, 1],
      [2, 2],
    ]);
  });

  it("names each group by the keys down to its level, and its parent by those above", () => {
    expect.hasAssertions();

    const { levels, total } = toMeasuredRows(
      [
        row({ level: -1, m_events: 5, tags: 3 }),
        row({ level: 0, m_events: 4, t0: MARS, tags: 2 }),
        row({ level: 1, m_events: 2, t0: MARS, t1: null, tags: 2 }),
      ],
      request,
    );

    expect(total[0]).toMatchObject({ id: "", key: null, parentId: "" });
    expect(levels[0]?.[0]).toMatchObject({
      id: `/0:${MARS}`,
      key: MARS,
      parentId: "",
    });
    expect(levels[1]?.[0]).toMatchObject({
      id: `/0:${MARS}/1:`,
      key: null,
      parentId: `/0:${MARS}`,
    });
  });

  it("carries a group's label, path, rank and period", () => {
    expect.hasAssertions();

    const { levels } = toMeasuredRows(
      [
        row({
          label: "Mars",
          level: 0,
          m_events: 4,
          path: "Body / Mars",
          period: 1,
          rank: "00000:Body / 00001:Mars",
          t0: MARS,
          tags: 2,
        }),
      ],
      request,
    );

    expect(levels[0]?.[0]).toMatchObject({
      label: "Mars",
      path: "Body / Mars",
      period: 1,
      rank: "00000:Body / 00001:Mars",
    });
  });

  it("reads a measure that is none as none, and computes the metrics from the rest", () => {
    expect.hasAssertions();

    const { total } = toMeasuredRows(
      [row({ level: -1, m_seconds: null, m_spans: 0 })],
      {
        levels: 0,
        measures: ["seconds", "spans"],
        metrics: [
          EventMetric.AVERAGE_DURATION_MINUTES,
          EventMetric.TOTAL_DURATION_MINUTES,
        ],
      },
    );

    expect(total[0]?.values).toStrictEqual([null, null]);
  });

  it("rejects a measure that is no number", () => {
    expect.hasAssertions();

    expect(() =>
      toMeasuredRows([row({ level: -1, m_events: "many" })], {
        levels: 0,
        measures: ["events"],
        metrics: [EventMetric.EVENTS],
      }),
    ).toThrow(/expected number/i);
  });
});
