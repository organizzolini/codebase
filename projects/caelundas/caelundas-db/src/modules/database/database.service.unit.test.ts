import { createMock } from "@golevelup/ts-vitest";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { DatabaseService } from "./database.service";
import { METRICS_REFRESH_STATEMENTS } from "./modules/metrics/calendar-event-facts.constants";

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

  it("refreshes the tag trees and the tag sets first, then rebuilds the facts, each through the manager it is given", async () => {
    const manager = createMock<EntityManager>();

    await service.refreshMetrics(manager);

    expect(manager.query).toHaveBeenCalledTimes(
      METRICS_REFRESH_STATEMENTS.length,
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      1,
      "refresh materialized view concurrently tag_trees",
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      2,
      "refresh materialized view concurrently calendar_event_tag_sets",
    );

    for (const [index, statement] of METRICS_REFRESH_STATEMENTS.entries()) {
      expect(manager.query).toHaveBeenNthCalledWith(index + 1, statement);
    }
  });
});
