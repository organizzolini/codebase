import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";

/** The district, place, and path entity files. */
const OWNED_GLOB = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/graphs/owned/*.entity.ts",
);

/** The tables the entities map to, created per test. */
const STATEMENTS = [
  "DROP TABLE IF EXISTS district_paths, districts, places",
  "CREATE TABLE districts (code text PRIMARY KEY, name text NOT NULL)",
  "CREATE TABLE places (number integer PRIMARY KEY, title text NOT NULL)",
  "CREATE TABLE district_paths (district_code text NOT NULL REFERENCES districts (code) ON DELETE CASCADE, source_place integer NOT NULL REFERENCES places (number) ON DELETE CASCADE, target_place integer NOT NULL REFERENCES places (number) ON DELETE CASCADE, PRIMARY KEY (district_code, source_place, target_place))",
  "INSERT INTO districts (code, name) VALUES ('N', 'North district'), ('S', 'South district')",
  "INSERT INTO places (number, title) VALUES (1, 'Alpha'), (2, 'Beta'), (3, 'Gamma'), (4, 'Delta'), (5, 'Epsilon')",
  "INSERT INTO district_paths (district_code, source_place, target_place) VALUES ('N', 1, 2), ('N', 2, 3), ('S', 4, 5)",
];

describe("render-graph-data, over a hand-written edge entity with an owner column", () => {
  let source: FixtureDatabase;

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    for (const statement of STATEMENTS) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "titles each neighborhood with its owner's label and each node with its own",
    async () => {
      const result = await runCliCommandLine({
        argv: [
          "render-graph-data",
          "--source-uri",
          source.uri,
          "--schema",
          "fixture",
          "--entities",
          OWNED_GLOB,
        ],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('subgraph nb0["North district"]');
      expect(result.stdout).toContain('n0["Alpha"]');
      expect(result.stdout).toContain('subgraph nb1["South district"]');
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
