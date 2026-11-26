import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";

/** The generated-form entity files, one glob each, and all of them. */
const GENERATED = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/graphs/generated",
);
const NETWORK_GLOB = path.join(GENERATED, "network.entity.ts");
const ALL_GLOB = path.join(GENERATED, "*.entity.ts");

/** The tables the entities map to, created per test. */
const DDL = [
  "DROP TABLE IF EXISTS network_lines, networks, stations, pipeline_dependencies, pipelines, jobs",
  "CREATE TABLE networks (code text PRIMARY KEY, title text NOT NULL)",
  "CREATE TABLE stations (number integer PRIMARY KEY, title text)",
  "CREATE TABLE network_lines (source_node integer NOT NULL REFERENCES stations (number) ON DELETE CASCADE, target_node integer NOT NULL REFERENCES stations (number) ON DELETE CASCADE, PRIMARY KEY (source_node, target_node))",
  "CREATE TABLE pipelines (code text PRIMARY KEY, title text NOT NULL)",
  "CREATE TABLE jobs (code text PRIMARY KEY, name text NOT NULL)",
  "CREATE TABLE pipeline_dependencies (from_code text NOT NULL REFERENCES jobs (code), to_code text NOT NULL REFERENCES jobs (code), PRIMARY KEY (from_code, to_code))",
];

/** Three lines of two neighborhoods, and a station with no title. */
const ROWS = [
  "INSERT INTO networks (code, title) VALUES ('N', 'North line')",
  "INSERT INTO stations (number, title) VALUES (1, 'Alpha'), (2, 'Beta'), (3, 'Gamma'), (4, 'Delta'), (5, NULL)",
  "INSERT INTO network_lines (source_node, target_node) VALUES (1, 2), (2, 3), (4, 5)",
  "INSERT INTO pipelines (code, title) VALUES ('P', 'Build')",
  "INSERT INTO jobs (code, name) VALUES ('a', 'Compile'), ('b', 'Test')",
  "INSERT INTO pipeline_dependencies (from_code, to_code) VALUES ('a', 'b')",
];

describe("render-graph-data, over a generated edge entity", () => {
  let source: FixtureDatabase;

  /** Runs `render-graph-data` through the real command line against the fixture database. */
  async function runRender(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "render-graph-data",
        "--source-uri",
        source.uri,
        "--schema",
        "fixture",
        ...argv,
      ],
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    for (const statement of [...DDL, ...ROWS]) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "labels each node with its own label, keeping the id of a node with none, and titles each neighborhood by its first node",
    async () => {
      const result = await runRender(["--entities", NETWORK_GLOB]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        [
          "flowchart LR",
          "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
          "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
          '    subgraph nb0["Alpha"]',
          '        n0["Alpha"]',
          '        n1["Beta"]',
          '        n2["Gamma"]',
          "        n0 --- n1",
          "        n1 --- n2",
          "    end",
          '    subgraph nb1["Delta"]',
          '        n3["Delta"]',
          '        n4["5"]',
          "        n3 --- n4",
          "    end",
          "    class n0 root",
          "    class n3 root",
          "",
        ].join("\n"),
      );
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "filters on the generated key columns, by their property names",
    async () => {
      const result = await runRender([
        "--entities",
        NETWORK_GLOB,
        "--filter",
        "sourceNode=4",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('n0["Delta"]');
      expect(result.stdout).not.toContain("Alpha");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "picks the graph entity --table names among several, and refuses one the other command draws",
    async () => {
      const picked = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "networks",
      ]);
      const refused = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "pipelines",
      ]);

      expect(picked.exitCode).toBe(0);
      expect(picked.stdout).toContain('n0["Alpha"]');
      expect(refused.exitCode).toBe(1);
      expect(refused.stderr).toContain(
        "pipelines is not drawn by render-graph-data; use render-directed-acyclic-graph-data instead",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "draws the only graph entity without --table, though the nodes' entities are loaded too",
    async () => {
      const result = await runRender([
        "--entities",
        NETWORK_GLOB,
        "--entities",
        path.join(GENERATED, "station.entity.ts"),
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('n0["Alpha"]');
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
