/**
 * Test utilities and mocks for lexico-cli.
 * Includes mocks for TypeORM repositories and helpers for Cheerio setup.
 */

import { createMock } from "@golevelup/ts-vitest";
import * as cheerio from "cheerio";
import { onTestFinished, vi } from "vitest";

import type { AnyNode } from "domhandler";
import type { ObjectLiteral, QueryBuilder, Repository } from "typeorm";

/**
 * Returns a setter that makes `process.stdin.isTTY` read as `isTerminal` for the current test.
 * The real value is restored when the test finishes.
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
 * Mocks TypeORM's `Repository`, with a `createQueryBuilder` whose chain methods return the same mock.
 * Terminal methods stay unimplemented; configure them per test.
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
 * Parses HTML and returns the first element matching `selector`, with its CheerioAPI.
 * Throws when nothing matches.
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
 * Parses HTML and returns the CheerioAPI with its root element.
 * Throws when the root cannot be extracted.
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
 * Parses XML and returns the first element matching `selector`, with its CheerioAPI.
 * Throws when nothing matches.
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
 * Parses XML and returns the CheerioAPI with its root element.
 * Throws when the root cannot be extracted.
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
