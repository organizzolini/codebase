import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import {
  createSeedRows,
  createSeedTrees,
} from "../../../../../../../testing/metric-catalog";
import { EventsService } from "../../../../events.service";

import { EventMetricsCatalogService } from "./event-metrics-catalog.service";

const select = vi.fn<(sql: string, ...rest: unknown[]) => Promise<unknown[]>>();
const findTrees = vi.fn<() => Promise<unknown[]>>();
const manager = { getTreeRepository: () => ({ findTrees }) };

/** Answers each of the two statements with the seeded rows. */
function answerSeed(): void {
  const rows = createSeedRows();

  findTrees.mockResolvedValue(createSeedTrees());
  select.mockImplementation(async (sql): Promise<unknown[]> => {
    await Promise.resolve();

    return sql.includes("from measures") ? rows.measures : rows.metrics;
  });
}

describe(EventMetricsCatalogService, () => {
  let service: EventMetricsCatalogService;

  beforeEach(async () => {
    select.mockReset();
    findTrees.mockReset();
    answerSeed();
    ({ instance: service } = await buildTestingModule(
      EventMetricsCatalogService,
      {
        providers: [
          { provide: EventsService, useValue: { select } },
          { provide: getEntityManagerToken(), useValue: manager },
        ],
      },
    ));
  });

  it("loads the catalog once and keeps it", async () => {
    expect.hasAssertions();

    const first = await service.getCatalog();
    const second = await service.getCatalog();

    expect(second).toBe(first);
    expect(first.metrics.size).toBe(18);
    expect(select).toHaveBeenCalledTimes(2);
  });

  it("reads the tables again after a reload", async () => {
    expect.hasAssertions();

    await service.getCatalog();
    service.reload();
    await service.getCatalog();

    expect(select).toHaveBeenCalledTimes(4);
  });

  it("tries again after a load that failed", async () => {
    expect.hasAssertions();

    select.mockRejectedValueOnce(new Error("no connection"));

    await expect(service.getCatalog()).rejects.toThrow("no connection");

    answerSeed();

    await expect(service.getCatalog()).resolves.toHaveProperty("metrics");
  });

  it("describes the catalog for the GraphQL query", async () => {
    expect.hasAssertions();

    const described = await service.describe();

    expect(described.metrics).toHaveLength(18);
    expect(described.measures).toHaveLength(18);
  });
});
