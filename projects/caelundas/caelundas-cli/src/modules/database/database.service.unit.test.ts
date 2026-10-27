import { Test } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { DatabaseService } from "./database.service";

import type { EntityManager } from "typeorm";

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

  it("runs each statement of the read-model file through the manager", async () => {
    expect.hasAssertions();

    const query = vi.fn<(statement: string) => Promise<unknown>>();
    query.mockResolvedValue(undefined);

    await service.refreshReadModel({ query } as unknown as EntityManager);

    expect(query.mock.calls.map(([statement]) => statement)).toStrictEqual([
      expect.stringContaining("delete from calendar_event_tag_nodes"),
      expect.stringContaining("delete from tag_nodes"),
      expect.stringContaining("insert into tag_nodes"),
      expect.stringContaining("insert into calendar_event_tag_nodes"),
    ]);
  });
});
