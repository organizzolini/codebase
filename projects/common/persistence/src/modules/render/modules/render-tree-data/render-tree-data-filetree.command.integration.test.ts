import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";

/** The adjacency-list entity, which reads the `list_tags` table. */
const LIST_GLOB = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/trees/list-tag.entity.ts",
);

/** The fixture tree as a file tree. */
const FILE_TREE = [
  "Work",
  "├── Email",
  "│   └── Inbox",
  "└── Meetings",
  "Errands",
].join("\n");

describe("render-tree-data --diagram filetree", () => {
  let source: FixtureDatabase;
  let directory: string;

  /** Runs `render-tree-data` on the list tree, resolving names in the `fixture` schema. */
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
        LIST_GLOB,
        ...argv,
      ],
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "render-tree-filetree-"));
    for (const statement of [
      "DROP TABLE IF EXISTS list_tags",
      "CREATE TABLE list_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer)",
      "INSERT INTO list_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL)",
    ]) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "draws the tree as a text file tree on stdout",
    async () => {
      const result = await runRender(["--diagram", "filetree"]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(`${FILE_TREE}\n`);
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "draws the flowchart when --diagram flowchart is given",
    async () => {
      const result = await runRender(["--diagram", "flowchart"]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.startsWith("flowchart LR\n")).toBe(true);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "shows a truncation node by its label and warns",
    async () => {
      const result = await runRender([
        "--diagram",
        "filetree",
        "--truncate-breadth",
        "1",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        [
          "Work",
          "├── Email",
          "│   └── Inbox",
          "└── … 1 more",
          "Errands",
          "",
        ].join("\n"),
      );
      expect(result.stderr).toContain("Node 1 hides 1 child beyond");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "writes each --limit page under its heading in a fenced text block",
    async () => {
      const file = path.join(directory, "tree.md");

      const result = await runRender([
        "--diagram",
        "filetree",
        "--limit",
        "1",
        "--output-markdown",
        file,
      ]);

      expect(result.exitCode).toBe(0);
      expect(fs.readFileSync(file, "utf8")).toBe(
        [
          "- [Page 1 of 2](#page-1-of-2): [Work](#page-1-of-2)",
          "- [Page 2 of 2](#page-2-of-2): [Errands](#page-2-of-2)",
          "",
          "## Page 1 of 2",
          "",
          "```text",
          "Work",
          "├── Email",
          "│   └── Inbox",
          "└── Meetings",
          "```",
          "",
          "## Page 2 of 2",
          "",
          "```text",
          "Errands",
          "```",
          "",
        ].join("\n"),
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails listing the choices when --diagram names another diagram",
    async () => {
      const result = await runRender(["--diagram", "pie"]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        '--diagram must be flowchart or filetree, e.g. --diagram filetree; got "pie"',
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
