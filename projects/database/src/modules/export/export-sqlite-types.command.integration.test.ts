import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../testing/fixture-database";

import type { FixtureDatabase } from "../../../testing/fixture-database";

describe("export --sqlite tables", () => {
  let source: FixtureDatabase;
  let directory: string;
  let file: string;

  /**
   * Runs `export --sqlite` of `tables` from the `fixture` schema into
   * `file`, writing `content`: `--data`, `--ddl`, or both.
   */
  async function runExport(
    tables: readonly string[],
    ...content: readonly string[]
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "export",
        "--sqlite",
        "--source-uri",
        source.uri,
        "--schema",
        "fixture",
        ...tables.flatMap((table) => ["--table", table]),
        ...content,
        "--file",
        file,
      ],
    });
  }

  /** What `sql` returns from the exported file, as plain objects. */
  function readBack(sql: string): Record<string, unknown>[] {
    const database = new DatabaseSync(file, { readOnly: true });
    try {
      return database
        .prepare(sql)
        .all()
        .map((row) => ({ ...row }));
    } finally {
      database.close();
    }
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
    await source.query(
      `CREATE TABLE mapped_samples (
        id uuid PRIMARY KEY,
        happened_at timestamptz NOT NULL,
        amount numeric(12, 4),
        tags text[],
        active boolean NOT NULL,
        occurred_on date,
        quantity integer,
        total bigint,
        document jsonb
      )`,
    );
    await source.query(
      `INSERT INTO mapped_samples VALUES
        ('00000000-0000-0000-0000-000000000001', '2025-03-20T14:46:00Z', 12.5, ARRAY['fire','cardinal'], true, '2025-03-20', 7, 9007199254740993, '{"a":[1,2]}'),
        ('00000000-0000-0000-0000-000000000002', '2025-03-21T00:00:00+02', NULL, NULL, false, NULL, NULL, NULL, NULL)`,
    );
    await source.query("CREATE TYPE mood AS ENUM ('calm', 'fierce')");
    await source.query(
      "CREATE TABLE array_samples (id integer PRIMARY KEY, moods mood[], weights numeric[], seen timestamptz[])",
    );
    await source.query(
      "INSERT INTO array_samples VALUES (1, ARRAY['calm', 'fierce']::mood[], ARRAY[1.5, 2], ARRAY['2025-03-20T14:46:00Z']::timestamptz[])",
    );
    await source.query(
      "CREATE TABLE keyed_samples (first_part text, second_part text, PRIMARY KEY (second_part, first_part))",
    );
    await source.query(
      "CREATE TABLE unmapped_samples (id uuid PRIMARY KEY, span interval)",
    );
    await source.query(
      "CREATE TABLE many_samples AS SELECT n FROM generate_series(1, 2500) AS n",
    );
    await source.query(
      "INSERT INTO widgets (display_name) VALUES ('sprocket'), ('lever')",
    );
    await source.query("CREATE SCHEMA other");
    await source.query("CREATE TABLE other.widgets (id integer)");
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-sqlite-type-"));
    file = path.join(directory, "fixture.sqlite");
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  describe("column types", () => {
    it(
      "stores timestamptz as ISO text, numeric as a real number, text[] as JSON text, and boolean as 0 or 1",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["mapped_samples"], "--data");

        expect(result.exitCode).toBe(0);
        expect(
          readBack(
            "SELECT happened_at, amount, tags, active, typeof(amount) AS amount_type FROM mapped_samples ORDER BY id",
          ),
        ).toStrictEqual([
          {
            active: 1,
            amount: 12.5,
            amount_type: "real",
            happened_at: "2025-03-20T14:46:00.000Z",
            tags: '["fire","cardinal"]',
          },
          {
            active: 0,
            amount: null,
            amount_type: "null",
            happened_at: "2025-03-20T22:00:00.000Z",
            tags: null,
          },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "stores dates as text, integers as numbers, bigints exactly, and JSON as text",
      async () => {
        expect.hasAssertions();

        await runExport(["mapped_samples"], "--data");

        expect(
          readBack(
            "SELECT occurred_on, quantity, CAST(total AS TEXT) AS total, document FROM mapped_samples ORDER BY id",
          ),
        ).toStrictEqual([
          {
            document: '{"a":[1,2]}',
            occurred_on: "2025-03-20",
            quantity: 7,
            total: "9007199254740993",
          },
          { document: null, occurred_on: null, quantity: null, total: null },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "stores an array of any element type as exact JSON text",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["array_samples"], "--data");

        expect(result.exitCode).toBe(0);
        expect(
          readBack("SELECT moods, weights, seen FROM array_samples"),
        ).toStrictEqual([
          {
            moods: '["calm","fierce"]',
            seen: '["2025-03-20T14:46:00+00:00"]',
            weights: "[1.5,2]",
          },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "fails naming the column of a type with no mapping, and writes nothing",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["unmapped_samples"], "--data");

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("fixture.unmapped_samples.span");
        expect(result.stderr).toContain("interval");
        expect(result.stderr).toContain("no SQLite mapping");
        expect(fs.readdirSync(directory)).toStrictEqual([]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("content", () => {
    it(
      "reads back as the source rows",
      async () => {
        expect.hasAssertions();

        const sourceRows = await source.query<{ display_name: string }>(
          "SELECT display_name FROM widgets ORDER BY display_name",
        );

        const result = await runExport(["widgets"], "--data", "--ddl");

        expect(result.exitCode).toBe(0);
        expect(
          readBack("SELECT display_name FROM widgets ORDER BY display_name"),
        ).toStrictEqual(sourceRows);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "writes every row of a table larger than one fetch",
      async () => {
        expect.hasAssertions();

        await runExport(["many_samples"], "--data");

        expect(
          readBack("SELECT count(*) AS total, sum(n) AS sum FROM many_samples"),
        ).toStrictEqual([{ sum: 3_126_250, total: 2500 }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "writes table definitions with --ddl alone, and no rows",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["mapped_samples"], "--ddl");

        expect(result.exitCode).toBe(0);
        expect(
          readBack(
            "SELECT sql FROM sqlite_master WHERE name = 'mapped_samples'",
          ),
        ).toStrictEqual([
          {
            sql: 'CREATE TABLE "mapped_samples" ("id" TEXT NOT NULL, "happened_at" TEXT NOT NULL, "amount" REAL, "tags" TEXT, "active" INTEGER NOT NULL, "occurred_on" TEXT, "quantity" INTEGER, "total" INTEGER, "document" TEXT, PRIMARY KEY ("id"))',
          },
        ]);
        expect(
          readBack("SELECT count(*) AS total FROM mapped_samples"),
        ).toStrictEqual([{ total: 0 }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "writes a composite primary key in the key's own column order",
      async () => {
        expect.hasAssertions();

        await runExport(["keyed_samples"], "--ddl");

        expect(
          readBack(
            "SELECT sql FROM sqlite_master WHERE name = 'keyed_samples'",
          ),
        ).toStrictEqual([
          {
            sql: 'CREATE TABLE "keyed_samples" ("first_part" TEXT NOT NULL, "second_part" TEXT NOT NULL, PRIMARY KEY ("second_part", "first_part"))',
          },
        ]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "writes rows with --data alone, which still need their table",
      async () => {
        expect.hasAssertions();

        const result = await runExport(["widgets"], "--data");

        expect(result.exitCode).toBe(0);
        expect(readBack("SELECT count(*) AS total FROM widgets")).toStrictEqual(
          [{ total: 2 }],
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "exports several tables into one file",
      async () => {
        expect.hasAssertions();

        const result = await runExport(
          ["widgets", "many_samples"],
          "--data",
          "--ddl",
        );

        expect(result.exitCode).toBe(0);
        expect(
          readBack(
            "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
          ),
        ).toStrictEqual([{ name: "many_samples" }, { name: "widgets" }]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "refuses two tables that would share a SQLite name, writing nothing",
      async () => {
        expect.hasAssertions();

        const result = await runExport(
          ["widgets", "other.widgets"],
          "--data",
          "--ddl",
        );

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain("fixture.widgets");
        expect(result.stderr).toContain("other.widgets");
        expect(result.stderr).toContain('"widgets"');
        expect(fs.readdirSync(directory)).toStrictEqual([]);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });
});
