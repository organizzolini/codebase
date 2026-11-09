/**
 * Test utilities and mocks for lexico-cli.
 * Includes mocks for TypeORM repositories and helpers for Cheerio setup.
 */

import { createMock } from "@golevelup/ts-vitest";
import * as cheerio from "cheerio";
import { afterEach, beforeEach, onTestFinished, vi } from "vitest";

import type { AnyNode } from "domhandler";
import type { ObjectLiteral, QueryBuilder, Repository } from "typeorm";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

// 🧪 Prompts Helpers

/**
 * A typed mock function for the `prompts` default export.
 * Use this type annotation in `vi.hoisted` declarations in test files.
 */
export type PromptsMock<Response extends Record<string, unknown>> = ReturnType<
  typeof vi.fn<() => Promise<Response>>
>;

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
 * Lets a test set whether `process.stdin` reads as a terminal, restoring the real value when the test finishes.
 */
export function mockStandardInputTerminal(): (isTerminal: boolean) => void {
  const original = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");

  return (isTerminal) => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: isTerminal,
      writable: true,
    });

    onTestFinished(() => {
      if (original) {
        Object.defineProperty(process.stdin, "isTTY", original);
      } else {
        Reflect.deleteProperty(process.stdin, "isTTY");
      }
    });
  };
}

/**
 * Sets a default resolved value for a `prompts` mock function.
 */
export function setPromptsMockResponse<
  Response extends Record<string, unknown>,
>(promptsMock: PromptsMock<Response>, response: Awaited<Response>): void {
  promptsMock.mockResolvedValue(response);
}

/**
 * Queues a one-time resolved value for a `prompts` mock function.
 */
export function setPromptsMockResponseOnce<
  Response extends Record<string, unknown>,
>(promptsMock: PromptsMock<Response>, response: Awaited<Response>): void {
  promptsMock.mockResolvedValueOnce(response);
}

/**
 * Mocks TypeORM's `Repository` with a chainable `createQueryBuilder`; configure
 * terminal methods per test with `.mockResolvedValue`.
 */
export const createRepositoryMock = <
  Entity extends ObjectLiteral = ObjectLiteral,
>(
  repository?: Repository<Entity>,
): Repository<Entity> => {
  return createMock<Repository<Entity>>(
    Object.assign(repository ?? {}, {
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
    }),
  );
};

// 🧭 Cheerio Helpers

/**
 * Loads HTML and selects one element by CSS selector, returning its CheerioAPI and element. Throws when nothing matches.
 */
export function loadCheerioElement(
  html: string,
  selector: string,
): { $: cheerio.CheerioAPI; element: AnyNode } {
  const $ = cheerio.load(html);
  const element = $(selector).get(0);

  if (!element) {
    throw new Error(
      `No element matching selector "${selector}" found in HTML document`,
    );
  }

  return { $, element };
}

/**
 * Loads HTML and returns its CheerioAPI and root element. Throws when the root cannot be extracted.
 */
export function loadCheerioWithRoot(html: string): {
  $: cheerio.CheerioAPI;
  rootElement: AnyNode;
} {
  const $ = cheerio.load(html);
  const rootElement = $.root().get(0);

  if (!rootElement) {
    throw new Error("Failed to extract root element from Cheerio document");
  }

  return { $, rootElement };
}

/**
 * Loads XML and selects one element by CSS selector, returning its CheerioAPI and element. Throws when nothing matches.
 */
export function loadCheerioXmlElement(
  xml: string,
  selector: string,
): { $: cheerio.CheerioAPI; element: AnyNode } {
  const $ = cheerio.load(xml, { xml: true });
  const element = $(selector).get(0);

  if (!element) {
    throw new Error(
      `No element matching selector "${selector}" found in XML document`,
    );
  }

  return { $, element };
}

/**
 * Loads XML and returns its CheerioAPI and root element. Throws when the root cannot be extracted.
 */
export function loadCheerioXmlWithRoot(xml: string): {
  $: cheerio.CheerioAPI;
  rootElement: AnyNode;
} {
  const $ = cheerio.load(xml, { xml: true });
  const rootElement = $.root().get(0);

  if (!rootElement) {
    throw new Error("Failed to extract root element from Cheerio XML document");
  }

  return { $, rootElement };
}
