import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EventMetricsResolver } from "./event-metrics.resolver";
import { EventMetricsService } from "./event-metrics.service";
import { EventMetricsCatalogService } from "./modules/catalog/event-metrics-catalog.service";

import type { EventMetricCatalogEntity } from "./modules/catalog/event-metrics-catalog.entities";
import type { EventMetricsInputEntity } from "./modules/inputs/event-metrics-input.entities";
import type { EventMetricsResultEntity } from "./modules/results/event-metrics-result.entities";

const findMetrics =
  vi.fn<
    (input: EventMetricsInputEntity) => Promise<EventMetricsResultEntity>
  >();
const describeCatalog = vi.fn<() => Promise<EventMetricCatalogEntity>>();

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

    await expect(resolver.eventMetrics(input)).resolves.toBe(result);
    expect(findMetrics).toHaveBeenCalledWith(input);
  });

  it("answers the catalog the catalog service describes", async () => {
    expect.hasAssertions();

    const catalog: EventMetricCatalogEntity = { measures: [], metrics: [] };

    describeCatalog.mockResolvedValue(catalog);

    await expect(resolver.eventMetricCatalog()).resolves.toBe(catalog);
  });
});
