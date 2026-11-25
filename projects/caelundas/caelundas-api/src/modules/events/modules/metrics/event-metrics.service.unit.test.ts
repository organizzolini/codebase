import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EventsService } from "../../events.service";
import { EventFilterService } from "../filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "../filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "../filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "../filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "../filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "../grouping/event-grouping.service";

import { EventMetricsService } from "./event-metrics.service";
import { EventMetric } from "./modules/inputs/event-metric.entities";
import { EventMetricsQueryService } from "./modules/query-building/event-metrics-query.service";

import type { EventMetricsInputEntity } from "./modules/inputs/event-metrics-input.entities";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";

const select = vi.fn<(...parameters: unknown[]) => Promise<unknown[]>>();
const describeDataset = vi.fn<() => Promise<null | { timezone: string }>>();

/** An input for March, with the parts given changed. */
function input(
  rest: Partial<EventMetricsInputEntity> = {},
): EventMetricsInputEntity {
  return {
    metrics: [EventMetric.EVENTS, EventMetric.COVERED_PERCENT],
    period: {
      end: "2026-04-01T00:00:00.000Z",
      start: "2026-03-01T00:00:00.000Z",
    },
    ...rest,
  };
}

describe(EventMetricsService, () => {
  let service: EventMetricsService;

  const providers = [
    EventFilterCalendarFieldsService,
    EventFilterNumbersService,
    EventFilterParametersService,
    EventFilterService,
    EventFilterValuesService,
    EventGroupingService,
    EventMetricsQueryService,
    { provide: EventsService, useValue: { describeDataset, select } },
  ];

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(EventMetricsService, {
      providers,
    }));
  });

  beforeEach(() => {
    select.mockReset();
    describeDataset.mockReset();
    describeDataset.mockResolvedValue({ timezone: "Europe/London" });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EventMetricsService, {
      providers,
    });

    expect(instance).toBeInstanceOf(EventMetricsService);
  });

  it("measures the whole set in one statement when nothing is grouped", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([{ m0: 7, m1: null, period: 0 }]);

    const result = await service.findMetrics(input());

    expect(select).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      groups: [],
      timezone: "Europe/London",
      total: [
        { metric: "EVENTS", previous: null, value: 7 },
        { metric: "COVERED_PERCENT", previous: null, value: null },
      ],
    });
  });

  it("reads a zone of UTC and zero counts from an empty dataset", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([]);
    describeDataset.mockResolvedValue(null);

    const result = await service.findMetrics(input());

    expect(result.timezone).toBe("UTC");
    expect(result.total[0]?.value).toBe(0);
  });

  it("asks the previous period of equal length when comparing", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([
      { m0: 7, m1: 1, period: 0 },
      { m0: 5, m1: 2, period: 1 },
    ]);

    const result = await service.findMetrics(
      input({ compareToPrevious: true }),
    );

    expect(select.mock.calls[0]?.[1]).toStrictEqual([
      "2026-03-01T00:00:00.000Z",
      "2026-04-01T00:00:00.000Z",
      "2026-01-29T00:00:00.000Z",
      "2026-03-01T00:00:00.000Z",
    ]);
    expect(result.total[0]).toStrictEqual({
      metric: "EVENTS",
      previous: 5,
      value: 7,
    });
  });

  it("runs a statement a level, one for the tag names, and builds the tree", async () => {
    expect.hasAssertions();

    // The statements start in order: the whole set, the names, the level.
    select
      .mockResolvedValueOnce([{ m0: 2, m1: null, period: 0 }])
      .mockResolvedValueOnce([{ id: ROOT, name: "Planet" }])
      .mockResolvedValueOnce([
        {
          id: "/0:",
          key: null,
          label: null,
          m0: 2,
          m1: null,
          orderKey: null,
          parent_id: "",
          path: null,
          period: 0,
        },
      ]);

    const result = await service.findMetrics(
      input({
        grouping: [{ field: `tag:${ROOT}` }],
        metrics: [EventMetric.EVENTS, EventMetric.COVERED_PERCENT],
        tagRoot: MARS,
      }),
    );

    expect(select).toHaveBeenCalledTimes(3);
    expect(select).toHaveBeenCalledWith(
      expect.stringContaining("from tags t"),
      [[ROOT]],
      expect.anything(),
    );
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ key: null, label: "No Planet" });
  });

  it("asks for no tag names for a grouping of derived fields or tags that are no ids", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([]);

    await service.findMetrics(
      input({
        grouping: [{ field: "year" }, { field: "tag:not-a-tag" }],
      }),
    );

    // The whole set and the two levels, with no statement for names.
    expect(select).toHaveBeenCalledTimes(3);
  });

  it("names a tag a level refines by its parent, once", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([]);

    await service.findMetrics(
      input({
        grouping: [
          { field: `tag:${ROOT}` },
          { field: `tag:${ROOT}`, parent: MARS },
        ],
      }),
    );

    expect(select).toHaveBeenCalledWith(
      expect.stringContaining("from tags t"),
      [[ROOT, MARS]],
      expect.anything(),
    );
  });

  describe("over the rollups", () => {
    /** Answers the guard with the zone rows given. */
    function answer(zone: unknown[]): void {
      select.mockImplementation(async (sql: unknown) => {
        const text = await Promise.resolve(String(sql));

        return text.includes("from zone z") ? zone : [];
      });
    }

    /** An input of events grouped by the levels given. */
    function grouped(
      grouping: NonNullable<EventMetricsInputEntity["grouping"]>,
    ): EventMetricsInputEntity {
      return input({ grouping, metrics: [EventMetric.EVENTS] });
    }

    /** The statements run, as text. */
    function statements(): string {
      return select.mock.calls.map(([sql]) => String(sql)).join("\n");
    }

    it("reads the whole set from the rollups in the zone the guard names", async () => {
      expect.hasAssertions();

      answer([{ timezone: "UTC" }]);

      await service.findMetrics(grouped([]));

      expect(statements()).toContain("from calendar_event_day_rollups r");
      expect(statements()).not.toContain("calendar_event_derived_times");
    });

    it("reads the events when the guard names no zone", async () => {
      expect.hasAssertions();

      answer([]);

      await service.findMetrics(grouped([]));

      expect(statements()).toContain("calendar_event_derived_times");
      expect(statements()).not.toContain("calendar_event_day_rollups r");
    });

    it("asks no guard of a request the rollups cannot answer", async () => {
      expect.hasAssertions();

      answer([{ timezone: "UTC" }]);

      await service.findMetrics(input());

      expect(select).toHaveBeenCalledTimes(1);
      expect(statements()).toContain("calendar_event_derived_times");
    });

    it("reads the first level from the rollups, and the rest from the events", async () => {
      expect.hasAssertions();

      answer([{ timezone: "UTC" }]);

      await service.findMetrics(
        grouped([{ field: `tag:${ROOT}` }, { field: "month" }]),
      );

      expect(statements()).toContain("from calendar_event_day_tag_rollups r");
      expect(statements()).toContain("calendar_event_derived_times");
    });
  });

  it("rejects a grouping of more levels than the events query allows", async () => {
    expect.hasAssertions();

    await expect(
      service.findMetrics(
        input({
          grouping: Array.from({ length: 17 }, () => ({ field: "year" })),
        }),
      ),
    ).rejects.toThrow(/too_big/);
  });
});
