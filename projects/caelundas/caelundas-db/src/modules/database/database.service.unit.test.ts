import { Test } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it } from "vitest";

import { DatabaseService } from "./database.service";

describe(DatabaseService, () => {
  const dataSource = { isInitialized: true };
  let service: DatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = await module.resolve(DatabaseService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
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
