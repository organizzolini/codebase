import { createMock } from "@golevelup/ts-vitest";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { READ_MODEL_STATEMENTS } from "./database.constants";
import { DatabaseService } from "./database.service";

import type { EntityManager } from "typeorm";

/** Whether TypeORM's `transaction` was given its callback first, with no isolation level. */
function isTransactionCallback(
  value: unknown,
): value is (transaction: EntityManager) => Promise<unknown> {
  return typeof value === "function";
}

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
