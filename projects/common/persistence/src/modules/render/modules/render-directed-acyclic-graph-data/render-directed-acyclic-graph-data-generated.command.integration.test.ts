import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";

/** The pipeline entity file, and all the entity files. */
const GENERATED = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/graphs/generated",
);
const PIPELINE_GLOB = path.join(GENERATED, "pipeline.entity.ts");
const ALL_GLOB = path.join(GENERATED, "*.entity.ts");

/** The tables the pipeline's generated edge entity maps to, created per test. */
const DDL = [
  "DROP TABLE IF EXISTS network_lines, networks, stations, pipeline_dependencies, pipelines, jobs",
  "CREATE TABLE networks (code text PRIMARY KEY, title text NOT NULL)",
  "CREATE TABLE stations (number integer PRIMARY KEY, title text)",
  "CREATE TABLE pipelines (code text PRIMARY KEY, title text NOT NULL)",
  "CREATE TABLE jobs (code text PRIMARY KEY, name text NOT NULL)",
  "CREATE TABLE pipeline_dependencies (pipeline_code text NOT NULL REFERENCES pipelines (code), from_code text NOT NULL REFERENCES jobs (code), to_code text NOT NULL REFERENCES jobs (code), PRIMARY KEY (pipeline_code, from_code, to_code))",
];

/** Two jobs, one waiting for the other. */
const ROWS = [
  "INSERT INTO pipelines (code, title) VALUES ('P', 'Build')",
  "INSERT INTO jobs (code, name) VALUES ('a', 'Compile'), ('b', 'Test')",
  "INSERT INTO pipeline_dependencies (pipeline_code, from_code, to_code) VALUES ('P', 'a', 'b')",
];

describe("render-directed-acyclic-graph-data, over a generated edge entity", () => {
  let source: FixtureDatabase;

  /** Runs the command through the real command line against the fixture database. */
  async function runRender(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "render-directed-acyclic-graph-data",
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
    "labels each node with its entity's label column and draws a lone neighborhood unboxed",
    async () => {
      const result = await runRender(["--entities", PIPELINE_GLOB]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        [
          "flowchart TB",
          "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
          "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
          '    n0["Compile"]',
          '    n1["Test"]',
          '    n0 -->|"Build"| n1',
          "    class n0 root",
          "",
        ].join("\n"),
      );
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "refuses a graph entity of the other kind, naming its command, before connecting",
    async () => {
      const result = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "networks",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "networks is not drawn by render-directed-acyclic-graph-data; use render-graph-data instead",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
