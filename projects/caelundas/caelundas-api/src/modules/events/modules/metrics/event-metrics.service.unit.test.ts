import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createSeedCatalog } from "../../../../../testing/metric-catalog";
import { EventsService } from "../../events.service";
import { EventFilterService } from "../filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "../filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "../filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "../filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "../filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "../grouping/event-grouping.service";

import { EventMetricsService } from "./event-metrics.service";
import { EventMetricsCatalogService } from "./modules/catalog/event-metrics-catalog.service";
import { EventMetricsFactsService } from "./modules/facts/event-metrics-facts.service";
import { EventMetricsQueryService } from "./modules/query-building/event-metrics-query.service";

import type { MetricCatalog } from "./modules/catalog/event-metrics-catalog.types";
import type { EventMetricsInputEntity } from "./modules/inputs/event-metrics-input.entities";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";

const select = vi.fn<(...parameters: unknown[]) => Promise<unknown[]>>();
const compileFacts = vi.fn<EventMetricsFactsService["compile"]>();
const describeDataset = vi.fn<() => Promise<null | { timezone: string }>>();

/** An input for March, with the parts given changed. */
function input(
  rest: Partial<EventMetricsInputEntity> = {},
): EventMetricsInputEntity {
  return {
    metrics: ["events", "covered-percent"],
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
    {
      provide: EventMetricsCatalogService,
      useValue: {
        getCatalog: vi
          .fn<() => Promise<MetricCatalog>>()
          .mockResolvedValue(createSeedCatalog()),
      },
    },
    { provide: EventMetricsFactsService, useValue: { compile: compileFacts } },
    {
      provide: EventsService,
      useValue: { describeDataset, select },
    },
  ];

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(EventMetricsService, {
      providers,
    }));
  });

  beforeEach(() => {
    select.mockReset();
    compileFacts.mockReset();
    // The facts answer nothing unless a test says so, leaving the events.
    compileFacts.mockReturnValue(null);
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
        { metric: "events", previous: null, value: 7 },
        { metric: "covered-percent", previous: null, value: null },
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
      metric: "events",
      previous: 5,
      value: 7,
    });
  });

  it("runs a statement a level, one for the tag names, and builds the tree", async () => {
    expect.hasAssertions();

    // The statements start in order: the whole set, the level, the children, the names.
    select
      .mockResolvedValueOnce([{ m0: 2, m1: null, period: 0 }])
      .mockResolvedValueOnce([
        {
          id: "/0:",
          key: null,
          label: null,
          m0: 2,
          m1: null,
          parent_id: "",
          path: null,
          period: 0,
          rank: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "/0:/1:kid",
          key: "kid",
          label: "Kid",
          m0: 1,
          m1: null,
          parent_id: "/0:",
          path: "Planet / Kid",
          period: 0,
          rank: "k",
        },
      ])
      .mockResolvedValueOnce([{ id: ROOT, name: "Planet" }]);

    const result = await service.findMetrics(
      input({
        grouping: [{ field: `tag:${ROOT}` }],
        metrics: ["events", "covered-percent"],
        tagRoot: MARS,
      }),
    );

    expect(select).toHaveBeenCalledTimes(4);
    expect(select).toHaveBeenCalledWith(
      expect.stringContaining("from tags t"),
      [[ROOT]],
      expect.anything(),
    );
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({ key: null, label: "No Planet" });
    expect(result.groups[0]?.children).toMatchObject([
      { id: "/0:/1:kid", isPreview: true, label: "Kid", level: 1 },
    ]);
  });

  it("asks for no children for a grouping of calendar fields", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([]);

    await service.findMetrics(input({ grouping: [{ field: "year" }] }));

    // The whole set and the one level.
    expect(select).toHaveBeenCalledTimes(2);
  });

  it("asks for no tag names for a grouping of derived fields or tags that are no ids", async () => {
    expect.hasAssertions();

    select.mockResolvedValue([]);

    await service.findMetrics(
      input({
        grouping: [{ field: "year" }, { field: "tag:not-a-tag" }],
      }),
    );

    // The whole set, the two levels and the children, with no statement for names.
    expect(select).toHaveBeenCalledTimes(4);
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
      return input({ grouping, metrics: ["events"] });
    }

    /** The statements run, as text. */
    function statements(): string {
      return select.mock.calls.map(([sql]) => String(sql)).join("\n");
    }

    it("reads the whole set from the rollups in the zone the guard names", async () => {
      expect.hasAssertions();

      answer([{ timezone: "UTC" }]);

      await service.findMetrics(grouped([]));

      expect(statements()).toContain("join calendar_event_facts r on");
      expect(statements()).not.toContain("events_in_periods");
    });

    it("reads the events when the guard names no zone", async () => {
      expect.hasAssertions();

      answer([]);

      await service.findMetrics(grouped([]));

      expect(statements()).toContain("events_in_periods");
      expect(statements()).not.toContain("join calendar_event_facts r on");
    });

    it("asks no guard of a request the rollups cannot answer", async () => {
      expect.hasAssertions();

      answer([{ timezone: "UTC" }]);

      await service.findMetrics(input());

      expect(select).toHaveBeenCalledTimes(1);
      expect(statements()).toContain("events_in_periods");
    });

    it("reads the first level from the rollups, and the rest from the events", async () => {
      expect.hasAssertions();

      answer([{ timezone: "UTC" }]);

      await service.findMetrics(
        grouped([{ field: `tag:${ROOT}` }, { field: "month" }]),
      );

      expect(statements()).toContain("join filters tf on");
      expect(statements()).toContain("events_in_periods");
    });
  });

  describe("over the facts", () => {
    it("reads the whole set and every level from one statement", async () => {
      expect.hasAssertions();

      compileFacts.mockReturnValue({
        children: false,
        levels: 1,
        parameters: [7],
        sql: "select facts",
      });
      select.mockResolvedValue([
        { level: -1, m0: 3, m1: null, period: 0 },
        { level: 0, m0: 2, m1: null, period: 0, t0: "2026" },
      ]);

      const result = await service.findMetrics(
        input({ grouping: [{ field: "year" }], metrics: ["unique-names"] }),
      );

      // A measure that does not merge never asks the rollups' guard, so only the facts run.
      expect(select).toHaveBeenCalledTimes(1);
      expect(select).toHaveBeenLastCalledWith(
        "select facts",
        [7],
        expect.anything(),
      );
      expect(result.total[0]?.value).toBe(3);
      expect(result.groups).toMatchObject([
        { id: "/0:2026", key: "2026", level: 0 },
      ]);
    });

    it("asks the facts for what the rollups cannot answer", async () => {
      expect.hasAssertions();

      select.mockResolvedValue([]);

      await service.findMetrics(input());

      expect(compileFacts).toHaveBeenCalledWith(
        expect.objectContaining({ filter: null, grouping: [] }),
      );
    });

    it("leaves what the rollups wholly cover to the rollups", async () => {
      expect.hasAssertions();

      select.mockImplementation(async (sql: unknown) => {
        const text = await Promise.resolve(String(sql));

        return text.includes("from zone z") ? [{ timezone: "UTC" }] : [];
      });

      await service.findMetrics(input({ grouping: [], metrics: ["events"] }));

      expect(compileFacts).not.toHaveBeenCalled();
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
