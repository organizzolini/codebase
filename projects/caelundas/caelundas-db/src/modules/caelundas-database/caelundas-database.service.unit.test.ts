import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { READ_MODEL_STATEMENTS } from "./caelundas-database.constants";
import { CaelundasDatabaseService } from "./caelundas-database.service";

import type { EntityManager } from "typeorm";

/** Whether TypeORM's `transaction` was given its callback first, with no isolation level. */
function isTransactionCallback(
  value: unknown,
): value is (transaction: EntityManager) => Promise<unknown> {
  return typeof value === "function";
}

describe(CaelundasDatabaseService, () => {
  const dataSource = { isInitialized: true };
  let service: CaelundasDatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CaelundasDatabaseService,
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = await module.resolve(CaelundasDatabaseService);
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

  it("runs every read model statement in order inside one transaction", async () => {
    const manager = createMock<EntityManager>();

    vi.mocked(manager.transaction).mockImplementation(
      async (
        callbackOrLevel: unknown,
        maybeCallback?: (transaction: EntityManager) => Promise<unknown>,
      ) => {
        const callback = isTransactionCallback(callbackOrLevel)
          ? callbackOrLevel
          : maybeCallback;

        await callback?.(manager);
      },
    );

    await service.refreshReadModel(manager);

    expect(manager.transaction).toHaveBeenCalledTimes(1);
    expect(vi.mocked(manager.query).mock.calls).toStrictEqual(
      READ_MODEL_STATEMENTS.map((statement) => [statement]),
    );
  });
});
