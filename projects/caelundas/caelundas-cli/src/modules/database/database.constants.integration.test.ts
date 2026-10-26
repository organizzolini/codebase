import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";

import { DATABASE_ENTITIES, DATABASE_PROJECT } from "./database.constants";
import { Migration1793045891250 } from "./migrations/1793045891250-migration";

import type { DataSource } from "typeorm";

// 🧪 Tests

const WEB_SCHEMA = path.resolve(
  import.meta.dirname,
  "../../../../caelundas-web/data/events-schema.sql",
);
const SCHEMA_QUERY = `select "type", "name", "sql" from sqlite_master where "name" not like 'sqlite_%' and "name" != 'migrations' order by "name"`;

interface SchemaRow {
  name: string;
  sql: string;
  type: string;
}

/** The statement without its case, spacing, or identifier quotes, which are formatting alone. */
function normalize({ name, sql, type }: SchemaRow): SchemaRow {
  return {
    name,
    sql: sql.replaceAll(/\s+|"/gu, "").toLowerCase(),
    type,
  };
}

/**
 * `caelundas-web` creates the tables of its seed, and every test that reads
 * them, from `data/events-schema.sql`, while the file the web build copies is
 * the one this project's migration creates. The two must agree, so a column
 * the migration changes cannot go unnoticed by the web application.
 */
describe("the schema caelundas-web expects", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createSqliteDataSource(
      {
        entities: DATABASE_ENTITIES,
        migrations: [Migration1793045891250],
        project: DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: ":memory:" },
    );
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("matches the tables and indexes the migration creates", async () => {
    expect.hasAssertions();

    const web = new DatabaseSync(":memory:");
    web.exec(readFileSync(WEB_SCHEMA, "utf8"));
    const expected = web.prepare(SCHEMA_QUERY).all() as unknown as SchemaRow[];
    web.close();
    const actual = await dataSource.query<SchemaRow[]>(SCHEMA_QUERY);

    expect(actual.map((row) => normalize(row))).toStrictEqual(
      expected.map((row) => normalize(row)),
    );
  });

  it("has no change left for the next generated migration to make", async () => {
    expect.hasAssertions();

    const pending = await dataSource.driver.createSchemaBuilder().log();

    expect(pending.upQueries).toStrictEqual([]);
  });
});
