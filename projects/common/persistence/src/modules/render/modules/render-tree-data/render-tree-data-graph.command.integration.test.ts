import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";

/** The entity whose generated `@Graph` edge joins its own rows. */
const SHELF_GLOB = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/trees/graphed/shelf-tag.entity.ts",
);

/** Novels under Fiction and under Classics, a shelf under two parents. */
const FILE_TREE = [
  "treeView-beta",
  '    "Books/"',
  '        "Fiction/"',
  '            "Novels"',
  '        "Classics/"',
  '            "Novels"',
  '    "Music"',
].join("\n");

describe("render-tree-data on a graph whose nodes have several parents", () => {
  let source: FixtureDatabase;

  /** Runs `render-tree-data` on the shelves, resolving names in the `fixture` schema. */
  async function runRender(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "render-tree-data",
        "--source-uri",
        source.uri,
        "--schema",
        "fixture",
        "--entities",
        SHELF_GLOB,
        ...argv,
      ],
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    for (const statement of [
      "DROP TABLE IF EXISTS shelf_links, shelf_tags",
      "CREATE TABLE shelf_tags (id integer PRIMARY KEY, name text NOT NULL)",
      "CREATE TABLE shelf_links (source_node integer NOT NULL REFERENCES shelf_tags (id), target_node integer NOT NULL REFERENCES shelf_tags (id), PRIMARY KEY (source_node, target_node))",
      "INSERT INTO shelf_tags (id, name) VALUES (1, 'Books'), (2, 'Fiction'), (3, 'Classics'), (4, 'Novels'), (5, 'Music')",
      "INSERT INTO shelf_links (source_node, target_node) VALUES (1, 2), (1, 3), (2, 4), (3, 4)",
    ]) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "draws a node with two parents once, with an edge from each",
    async () => {
      const result = await runRender([]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('n0["Books"]');
      expect(result.stdout.match(/\["Novels"\]/gu)).toHaveLength(1);
      expect(result.stdout).toContain("n1 --> n3");
      expect(result.stdout).toContain("n2 --> n3");
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "lists a node under each parent in a file tree",
    async () => {
      const result = await runRender(["--diagram", "filetree"]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`${FILE_TREE}\n`);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "keeps every parent of a node a filter matches",
    async () => {
      const result = await runRender(["--filter", "name=Novels"]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('["Fiction"]');
      expect(result.stdout).toContain('["Classics"]');
      expect(result.stdout).not.toContain('["Music"]');
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
