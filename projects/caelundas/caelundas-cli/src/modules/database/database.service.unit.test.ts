import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { DatabaseService } from "./database.service";

describe(DatabaseService, () => {
  const dataSource = { isInitialized: true };
  let service: DatabaseService;

  const testingModuleOptions = {
    providers: [{ provide: getDataSourceToken(), useValue: dataSource }],
  };

  beforeAll(async () => {
    const { instance } = await buildTestingModule(
      DatabaseService,
      testingModuleOptions,
    );

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      DatabaseService,
      testingModuleOptions,
    );

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
});
