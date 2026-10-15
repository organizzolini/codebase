import { QueryFailedError } from "typeorm";
import { describe, expect, it } from "vitest";

import { PostgresReferencedTablesError } from "./postgres-client.constants";
import {
  quotePostgresTable,
  truncatePostgresTables,
} from "./postgres-truncate.utilities";

import type { PostgresQuery } from "./postgres-client.types";

/** One statement a fake query function was given. */
interface Statement {
  readonly parameters: readonly unknown[];
  readonly sql: string;
}

/**
 * A query function that records each statement and answers it with what
 * `answer` returns or throws for it.
 */
function fakeQuery(answer: (sql: string) => unknown[] = () => []): {
  query: PostgresQuery;
  statements: Statement[];
} {
  const statements: Statement[] = [];
  const query: PostgresQuery = async (sql, parameters = []) =>
    new Promise((resolve) => {
      statements.push({ parameters, sql });
      resolve(answer(sql));
    });
  return { query, statements };
}

/** The error Postgres raises for a truncate an unselected table blocks. */
function featureNotSupported(): QueryFailedError {
  return new QueryFailedError(
    "TRUNCATE",
    [],
    Object.assign(
      new Error(
        "cannot truncate a table referenced in a foreign key constraint",
      ),
      { code: "0A000" },
    ),
  );
}

describe("postgres truncate utilities", () => {
  describe(quotePostgresTable, () => {
    it.each([
      ["lexico.words", '"lexico"."words"'],
      ['odd"schema.Mixed Case', '"odd""schema"."Mixed Case"'],
      ["archive.notes.extra", '"archive"."notes.extra"'],
    ])("quotes %s as %s", (table, quoted) => {
      expect(quotePostgresTable(table)).toBe(quoted);
    });
  });

  describe(truncatePostgresTables, () => {
    it("empties every table in one TRUNCATE, quoted and without CASCADE", async () => {
      const { query, statements } = fakeQuery();

      await truncatePostgresTables(query, ["lexico.words", "lexico.lexemes"]);

      expect(statements).toStrictEqual([
        {
          parameters: [],
          sql: 'TRUNCATE TABLE "lexico"."words", "lexico"."lexemes"',
        },
      ]);
    });

    it("names the unselected tables that reference a selected one", async () => {
      const { query, statements } = fakeQuery((sql) => {
        if (sql.startsWith("TRUNCATE")) throw featureNotSupported();
        return [{ table: "archive.refs" }, { table: "lexico.notes" }];
      });

      const truncating = truncatePostgresTables(query, ["archive.notes"]);

      await expect(truncating).rejects.toThrow(PostgresReferencedTablesError);
      await expect(truncating).rejects.toMatchObject({
        referencing: ["archive.refs", "lexico.notes"],
      });
      expect(statements[1]?.sql).toContain("pg_constraint");
      expect(statements[1]?.parameters).toStrictEqual([['"archive"."notes"']]);
    });

    it("rethrows a refusal the catalog cannot explain", async () => {
      const refusal = featureNotSupported();
      const { query } = fakeQuery((sql) => {
        if (sql.startsWith("TRUNCATE")) throw refusal;
        return [];
      });

      await expect(
        truncatePostgresTables(query, ["archive.notes"]),
      ).rejects.toBe(refusal);
    });

    it.each([
      [
        "a query error with another code",
        Object.assign(new Error("no such table"), { code: "42P01" }),
      ],
      ["an error without a code", new Error("connection lost")],
      [
        "an error with a numeric code",
        Object.assign(new Error("connection lost"), { code: 57 }),
      ],
    ])("rethrows %s without asking the catalog", async (_case, failure) => {
      const { query, statements } = fakeQuery(() => {
        throw failure;
      });

      await expect(
        truncatePostgresTables(query, ["archive.notes"]),
      ).rejects.toBe(failure);
      expect(statements).toHaveLength(1);
    });
  });
});
