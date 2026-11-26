import { createMock } from "@golevelup/ts-vitest";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { METRICS_REFRESH_STATEMENT } from "./database.constants";
import { DatabaseService } from "./database.service";

import type { EntityManager } from "typeorm";

describe(DatabaseService, () => {
  const dataSource = { isInitialized: true };
  let service: DatabaseService;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(DatabaseService, {
      providers: [{ provide: getDataSourceToken(), useValue: dataSource }],
    }));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(DatabaseService, {
      providers: [{ provide: getDataSourceToken(), useValue: dataSource }],
    });

    expect(instance).toBeInstanceOf(DatabaseService);
  });

  it("reports an initialized data source as connected", () => {
    dataSource.isInitialized = true;

    expect(service.isConnected()).toBe(true);
  });

  it("reports an uninitialized data source as disconnected", () => {
    dataSource.isInitialized = false;

    expect(service.isConnected()).toBe(false);
  });

  it("refreshes the metrics view concurrently through the manager it is given", async () => {
    const manager = createMock<EntityManager>();

    await service.refreshMetrics(manager);

    expect(manager.query).toHaveBeenCalledExactlyOnceWith(
      "refresh materialized view concurrently calendar_event_facts",
    );
    expect(METRICS_REFRESH_STATEMENT).toContain("concurrently");
  });
});
