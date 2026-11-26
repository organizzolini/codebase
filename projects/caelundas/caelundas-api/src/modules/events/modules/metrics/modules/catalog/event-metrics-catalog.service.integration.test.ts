import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startEventsApplication,
} from "../../../../../../../testing/events-application";
import { createSeedCatalog } from "../../../../../../../testing/metric-catalog";

import { EventMetricsCatalogService } from "./event-metrics-catalog.service";

import type { EventsApplication } from "../../../../../../../testing/events-application";
import type { MetricCatalog } from "./event-metrics-catalog.types";

/** What of a catalog the statements depend on: not names, notes or ids. */
function shape(catalog: MetricCatalog): unknown {
  return {
    measures: [...catalog.measures.values()]
      .toSorted((left, right) => left.slug.localeCompare(right.slug))
      .map((measure) => ({
        aggregate: measure.aggregate,
        argument: measure.argument,
        conditionColumn: measure.conditionColumn,
        factsColumn: measure.factsColumn,
        grains: measure.grains,
        slug: measure.slug,
        unit: measure.unit,
      })),
    metrics: [...catalog.metrics.values()]
      .toSorted((left, right) => left.slug.localeCompare(right.slug))
      .map((metric) => ({
        additive: metric.additive,
        expression: metric.expression,
        slug: metric.slug,
        unit: metric.unit,
        zeroIfEmpty: metric.zeroIfEmpty,
      })),
  };
}

/**
 * Loads the catalog from a Postgres built by the real migration, which seeds
 * it, and checks it is the one the unit tests compile.
 */
describe("event metrics catalog over the migrated database", () => {
  let application: EventsApplication;
  let service: EventMetricsCatalogService;

  beforeAll(async () => {
    application = await startEventsApplication();
    service = application.database.module.get(EventMetricsCatalogService, {
      strict: false,
    });
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("loads the nineteen seeded metrics and measures the tests compile", async () => {
    expect.hasAssertions();

    const catalog = await service.getCatalog();

    expect(catalog.metrics.size).toBe(18);
    expect(catalog.measures.size).toBe(18);
    expect(shape(catalog)).toStrictEqual(shape(createSeedCatalog()));
  });

  it("gives every measure and metric a name, an icon and a note", async () => {
    expect.hasAssertions();

    const catalog = await service.getCatalog();

    for (const entry of [
      ...catalog.measures.values(),
      ...catalog.metrics.values(),
    ]) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.icon.length).toBeGreaterThan(0);
      expect(entry.note.length).toBeGreaterThan(0);
    }
  });
});
