import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { TagFlagsService } from "../tag-flags/tag-flags.service";

import { EventMetricsResolver } from "./event-metrics.resolver";
import { EventMetricsService } from "./event-metrics.service";
import { EventMetricsCatalogService } from "./modules/catalog/event-metrics-catalog.service";

import type { TagInputs } from "../tag-flags/tag-flags.types";
import type { EventMetricCatalogEntity } from "./modules/catalog/event-metrics-catalog.entities";
import type { EventMetricsInputEntity } from "./modules/inputs/event-metrics-input.entities";
import type { EventMetricsResultEntity } from "./modules/results/event-metrics-result.entities";

const findMetrics =
  vi.fn<
    (input: EventMetricsInputEntity) => Promise<EventMetricsResultEntity>
  >();
const describeCatalog = vi.fn<() => Promise<EventMetricCatalogEntity>>();
const sanitize = vi.fn<(inputs: TagInputs) => Promise<TagInputs>>();

describe(EventMetricsResolver, () => {
  let resolver: EventMetricsResolver;

  beforeAll(async () => {
    ({ instance: resolver } = await buildTestingModule(EventMetricsResolver, {
      providers: [
        { provide: EventMetricsService, useValue: { findMetrics } },
        {
          provide: EventMetricsCatalogService,
          useValue: { describe: describeCatalog },
        },
        { provide: TagFlagsService, useValue: { sanitize } },
      ],
    }));
  });

  it("resolves with its dependencies", () => {
    expect(resolver).toBeInstanceOf(EventMetricsResolver);
  });

  it("answers the metrics service's result for the input", async () => {
    expect.hasAssertions();

    const input: EventMetricsInputEntity = {
      metrics: ["events"],
      period: { end: "2026-04-01", start: "2026-03-01" },
    };
    const result: EventMetricsResultEntity = {
      groups: [],
      timezone: "UTC",
      total: [],
    };

    findMetrics.mockResolvedValue(result);
    sanitize.mockResolvedValue({});

    await expect(resolver.eventMetrics(input)).resolves.toBe(result);
    expect(findMetrics).toHaveBeenCalledWith(input);
  });

  it("measures with the filter and levels the tag flags leave", async () => {
    expect.hasAssertions();

    const input: EventMetricsInputEntity = {
      grouping: [],
      metrics: ["events"],
      period: { end: "2026-04-01", start: "2026-03-01" },
    };

    findMetrics.mockResolvedValue({ groups: [], timezone: "UTC", total: [] });
    sanitize.mockResolvedValue({ filter: null, levels: [] });

    await resolver.eventMetrics(input);

    expect(sanitize).toHaveBeenCalledWith({ filter: undefined, levels: [] });
    expect(findMetrics).toHaveBeenLastCalledWith(input);
    expect(input.filter).toBeNull();
    expect(input.grouping).toStrictEqual([]);
  });

  it("answers the catalog the catalog service describes", async () => {
    expect.hasAssertions();

    const catalog: EventMetricCatalogEntity = { measures: [], metrics: [] };

    describeCatalog.mockResolvedValue(catalog);

    await expect(resolver.eventMetricCatalog()).resolves.toBe(catalog);
  });
});
