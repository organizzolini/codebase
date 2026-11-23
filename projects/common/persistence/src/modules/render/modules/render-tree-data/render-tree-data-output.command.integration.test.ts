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
import { renderGraphMermaid } from "../render-mermaid/render-mermaid.utilities";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";
import type { GraphModel } from "../render-mermaid/render-mermaid.types";

/** The adjacency-list entity, which reads the `list_tags` table. */
const LIST_GLOB = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/trees/list-tag.entity.ts",
);

/** The fixture tree's diagram, without its final newline. */
const DIAGRAM = [
  "flowchart LR",
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
  '    subgraph nb0["Work"]',
  '        n0["Work"]',
  '        n1["Email"]',
  '        n2["Meetings"]',
  '        n3["Inbox"]',
  "        n0 --> n1",
  "        n0 --> n2",
  "        n1 --> n3",
  "    end",
  '    subgraph nb1["Errands"]',
  '        n4["Errands"]',
  "    end",
  "    class n0 root",
  "    class n4 root",
].join("\n");

/** The warning a row with a missing parent draws. */
const STRAY_WARNING =
  "Node 6 names parent 99, which no row has; drawn as a root";

/** A diagram written as Markdown, in one mermaid fence. */
const markdownOf = (diagram: string): string =>
  `\`\`\`mermaid\n${diagram}\n\`\`\`\n`;

/** A connection to a database that refuses every connection. */
const UNREACHABLE_URI =
  "postgresql://fixture_user:output-fixture-secret-44d1@127.0.0.1:1/fixture_db";

describe("render-tree-data output files", () => {
  let source: FixtureDatabase;
  let directory: string;

  /** Runs `render-tree-data` on the list tree, resolving names in the `fixture` schema. */
  async function runRender(
    argv: readonly string[],
    sourceUri: string = source.uri,
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "render-tree-data",
        "--source-uri",
        sourceUri,
        "--schema",
        "fixture",
        "--entities",
        LIST_GLOB,
        ...argv,
      ],
    });
  }

  /** Reads a file the run wrote, as the graph model it holds. */
  function readModel(file: string): GraphModel {
    return JSON.parse(fs.readFileSync(file, "utf8")) as GraphModel;
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "render-tree-output-"));
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
    "writes the Markdown diagram alone, creating missing folders, with nothing on stdout",
    async () => {
      const file = path.join(directory, "reports", "tree.md");

      const result = await runRender(["--output-markdown", file]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("");
      expect(fs.readFileSync(file, "utf8")).toBe(markdownOf(DIAGRAM));
      expect(result.logs.join("\n")).toContain(file);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "headings each repeated --page by its own number, in the order given",
    async () => {
      const file = path.join(directory, "pages.md");

      const result = await runRender([
        "--limit",
        "1",
        "--page",
        "2",
        "--page",
        "1",
        "--output-markdown",
        file,
      ]);

      const markdown = fs.readFileSync(file, "utf8");

      expect(result.exitCode).toBe(0);
      expect(markdown.indexOf("## Page 2")).toBeGreaterThanOrEqual(0);
      expect(markdown.indexOf("## Page 2")).toBeLessThan(
        markdown.indexOf("## Page 1"),
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "writes the JSON graph alone, and it parses back to the diagram drawn from it",
    async () => {
      const file = path.join(directory, "tree.json");

      const result = await runRender(["--output-json", file]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");

      const model = readModel(file);

      expect(renderGraphMermaid(model, { direction: "LR" }).diagram).toBe(
        DIAGRAM,
      );
      expect(model.warnings).toStrictEqual([]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "writes both files when both flags are given, with nothing on stdout",
    async () => {
      const markdown = path.join(directory, "tree.md");
      const json = path.join(directory, "tree.json");

      const result = await runRender([
        "--output-markdown",
        markdown,
        "--output-json",
        json,
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(fs.readFileSync(markdown, "utf8")).toBe(markdownOf(DIAGRAM));
      expect(
        renderGraphMermaid(readModel(json), { direction: "LR" }).diagram,
      ).toBe(DIAGRAM);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "keeps warnings on stderr and after the Markdown fence, and carries them in the JSON",
    async () => {
      await source.query(
        "INSERT INTO list_tags (id, name, parent_id) VALUES (6, 'Stray', 99)",
      );
      const markdown = path.join(directory, "tree.md");
      const json = path.join(directory, "tree.json");

      const result = await runRender([
        "--output-markdown",
        markdown,
        "--output-json",
        json,
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe(`⚠️ ${STRAY_WARNING}\n`);

      const [fenced, notes] = fs
        .readFileSync(markdown, "utf8")
        .split("\n```\n");

      expect(fenced).not.toContain("names parent");
      expect(notes).toContain(`> ⚠️ ${STRAY_WARNING}`);
      expect(readModel(json).warnings).toStrictEqual([STRAY_WARNING]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "refuses an existing file without --overwrite, leaving it unchanged, and replaces it with --overwrite",
    async () => {
      const file = path.join(directory, "tree.md");
      fs.writeFileSync(file, "kept");

      const refused = await runRender(["--output-markdown", file]);

      expect(refused.exitCode).toBe(1);
      expect(refused.stdout).toBe("");
      expect(refused.stderr).toContain(
        `${file} already exists and was left unchanged`,
      );
      expect(fs.readFileSync(file, "utf8")).toBe("kept");

      const replaced = await runRender([
        "--output-markdown",
        file,
        "--overwrite",
      ]);

      expect(replaced.exitCode).toBe(0);
      expect(fs.readFileSync(file, "utf8")).toBe(markdownOf(DIAGRAM));
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "refuses a directory path before connecting to any database",
    async () => {
      const result = await runRender(
        ["--output-json", directory],
        UNREACHABLE_URI,
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        `--output-json ${directory} is a directory`,
      );
      expect(result.stderr).not.toContain("ECONNREFUSED");
      expect(result.stderr).not.toContain("output-fixture-secret-44d1");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "writes no file when the connection fails",
    async () => {
      const file = path.join(directory, "tree.json");

      const result = await runRender(["--output-json", file], UNREACHABLE_URI);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(fs.existsSync(file)).toBe(false);
      expect(result.stderr).not.toContain("output-fixture-secret-44d1");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "refuses both flags naming one file before connecting to any database",
    async () => {
      const file = path.join(directory, "tree");

      const result = await runRender(
        ["--output-markdown", file, "--output-json", file],
        UNREACHABLE_URI,
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("name the same file");
      expect(result.stderr).not.toContain("ECONNREFUSED");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "plans its output files in a dry run without creating them",
    async () => {
      const file = path.join(directory, "tree.md");

      const result = await runCliCommandLine({
        argv: [
          "render-tree-data",
          "--dry-run",
          "--source-uri",
          source.uri,
          "--schema",
          "fixture",
          "--entities",
          LIST_GLOB,
          "--output-markdown",
          file,
        ],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.logs.join("\n")).toContain(`Planning to create ${file}`);
      expect(fs.existsSync(file)).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
