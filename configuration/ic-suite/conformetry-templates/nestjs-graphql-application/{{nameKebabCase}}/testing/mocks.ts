import { createMock } from "@golevelup/ts-vitest";
import { afterEach, beforeEach, vi } from "vitest";

import type { ObjectLiteral, QueryBuilder, Repository } from "typeorm";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

/**
 * Fakes timers at a fixed system time before each test and restores real
 * timers after.
 */
export function mockDates(date: Date = DEFAULT_TEST_DATE): void {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

/**
 * Mocks TypeORM's `Repository` with a chainable `createQueryBuilder`; configure
 * terminal methods per test with `.mockResolvedValue`.
 */
export const createRepositoryMock = <
  Entity extends ObjectLiteral = ObjectLiteral,
>(): Repository<Entity> => {
  return createMock<Repository<Entity>>({
    createQueryBuilder: vi
      .fn<Repository<Entity>["createQueryBuilder"]>()
      .mockReturnValue(
        createMock<ReturnType<Repository<Entity>["createQueryBuilder"]>>({
          andWhere: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          execute: vi.fn<never>(),
          from: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          getCount: vi.fn<() => Promise<number>>(),
          getMany: vi.fn<() => Promise<Entity[]>>(),
          getManyAndCount: vi.fn<() => Promise<[Entity[], number]>>(),
          getOne: vi.fn<() => Promise<Entity | null>>(),
          getRawMany: vi.fn<() => Promise<Entity[]>>(),
          getRawOne: vi.fn<() => Promise<Entity>>(),
          groupBy: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          innerJoin: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          innerJoinAndSelect: vi
            .fn<() => QueryBuilder<Entity>>()
            .mockReturnThis(),
          insert: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          leftJoin: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          leftJoinAndSelect: vi
            .fn<() => QueryBuilder<Entity>>()
            .mockReturnThis(),
          limit: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          offset: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          orderBy: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          orWhere: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          select: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          setParameter: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          setParameters: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          skip: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          take: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          update: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
          where: vi.fn<() => QueryBuilder<Entity>>().mockReturnThis(),
        }),
      ),
  });
};
