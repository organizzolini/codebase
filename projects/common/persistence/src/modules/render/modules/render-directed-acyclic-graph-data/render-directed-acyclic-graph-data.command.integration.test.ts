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
import { renderGraphMermaid } from "../../../graph-mermaid/graph-mermaid.utilities";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";
import type { GraphModel } from "../../../graph-mermaid/graph-mermaid.types";

/** The edge entity files, one glob each, and all of them. */
const GRAPHS = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/graphs",
);
const TASK_GLOB = path.join(GRAPHS, "task-link.entity.ts");
const GRAPH_LINK_GLOB = path.join(GRAPHS, "graph-link.entity.ts");
const ALL_GLOB = path.join(GRAPHS, "*.entity.ts");
const BROKEN_GLOB = path.join(GRAPHS, "invalid", "*.entity.ts");

/** The tables the edge fixtures read, created per test. */
const DIRECTED_ACYCLIC_GRAPH_DDL = [
  "DROP TABLE IF EXISTS task_links, step_links, graph_links, broken_links",
  "CREATE TABLE task_links (id integer PRIMARY KEY, source text NOT NULL, target text NOT NULL, label text, weight double precision)",
  "CREATE TABLE step_links (id integer PRIMARY KEY, source integer NOT NULL, target integer NOT NULL)",
  "CREATE TABLE graph_links (id integer PRIMARY KEY, source text NOT NULL, target text NOT NULL)",
  "CREATE TABLE broken_links (id integer PRIMARY KEY, target text NOT NULL)",
];

/** A diamond directed acyclic graph and a separate Audit edge. */
const DIRECTED_ACYCLIC_GRAPH_ROWS = [
  "INSERT INTO task_links (id, source, target) VALUES (1, 'Plan', 'Design'), (2, 'Plan', 'Build'), (3, 'Design', 'Ship'), (4, 'Build', 'Ship'), (5, 'Audit', 'Report')",
  "INSERT INTO step_links (id, source, target) VALUES (1, 1, 2), (2, 2, 3)",
  "INSERT INTO graph_links (id, source, target) VALUES (1, 'A', 'B')",
];

/** The two lines every diagram opens with after its direction. */
const CLASS_DEFINITIONS = [
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
];

/** The diagram of `lines`, indented under the header, as stdout holds it. */
const drawnDiagram = (lines: readonly string[]): string =>
  [
    "flowchart TB",
    ...CLASS_DEFINITIONS,
    ...lines.map((line) => `    ${line}`),
    "",
  ].join("\n");

/** A `subgraph` block: its numbered id and title, then its indented lines. */
const subgraph = (
  index: number,
  title: string,
  lines: readonly string[],
): string[] => [
  `subgraph nb${index}["${title}"]`,
  ...lines.map((line) => `    ${line}`),
  "end",
];

/** The diamond, its edges in source then target order. */
const DIAMOND_LINES = [
  ...subgraph(0, "Audit", ['n0["Audit"]', 'n1["Report"]', "n0 --> n1"]),
  ...subgraph(1, "Plan", [
    'n2["Build"]',
    'n3["Ship"]',
    'n4["Design"]',
    'n5["Plan"]',
    "n2 --> n3",
    "n4 --> n3",
    "n5 --> n2",
    "n5 --> n4",
  ]),
  "class n0 root",
  "class n5 root",
];

describe("render-directed-acyclic-graph-data", () => {
  let source: FixtureDatabase;
  let directory: string;

  /**
   * Runs `render-directed-acyclic-graph-data` through the real command line against the fixture
   * database, resolving unqualified names in the `fixture` schema.
   */
  async function runRender(
    argv: readonly string[],
    sourceUri: string = source.uri,
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "render-directed-acyclic-graph-data",
        "--source-uri",
        sourceUri,
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
    directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "render-directed-acyclic-graph-output-"),
    );
    for (const statement of [
      ...DIRECTED_ACYCLIC_GRAPH_DDL,
      ...DIRECTED_ACYCLIC_GRAPH_ROWS,
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
    "draws a diamond directed acyclic graph as its expected diagram on stdout, with no warnings",
    async () => {
      const result = await runRender(["--entities", TASK_GLOB]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(drawnDiagram(DIAMOND_LINES));
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "labels an edge with its label and weight columns",
    async () => {
      await source.query(
        "UPDATE task_links SET label = 'needs', weight = 2.5 WHERE id = 1",
      );

      const result = await runRender(["--entities", TASK_GLOB]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('n5 -->|"needs (2.5)"| n4');
      expect(result.stdout).toContain("n5 --> n2");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "draws a numeric edge table with its integer endpoints as text, picked with --table",
    async () => {
      const result = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "step_links",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        drawnDiagram([
          'n0["1"]',
          'n1["2"]',
          'n2["3"]',
          "n0 --> n1",
          "n1 --> n2",
          "class n0 root",
        ]),
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails naming every @DirectedAcyclicGraph table when several match and --table is not given",
    async () => {
      const result = await runRender(["--entities", ALL_GLOB]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        "Several @DirectedAcyclicGraph entities match --entities: step_links, task_links; name one with --table",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "rejects a @Graph entity, pointing to render-graph-data",
    async () => {
      const result = await runRender(["--entities", GRAPH_LINK_GLOB]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        "graph_links is not drawn by render-directed-acyclic-graph-data; use render-graph-data instead",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "rejects a @Graph entity named with --table, pointing to render-graph-data",
    async () => {
      const result = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "graph_links",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "graph_links is not drawn by render-directed-acyclic-graph-data; use render-graph-data instead",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails when --table names a table no edge entity has",
    async () => {
      const result = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "gadgets",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "No @DirectedAcyclicGraph or @Graph entity has table gadgets",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails naming the decorator and property when a declared column is not a column",
    async () => {
      const result = await runRender(["--entities", BROKEN_GLOB]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        "BrokenLink marks origin with @GraphSource, but origin is not a column of BrokenLink; columns are ",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  describe("cycles", () => {
    it(
      "warns once, naming the nodes of a cycle, and still draws it",
      async () => {
        await source.query(
          "INSERT INTO task_links (id, source, target) VALUES (6, 'Ship', 'Plan')",
        );

        const result = await runRender(["--entities", TASK_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toBe(
          "⚠️ Cycle among nodes Build, Design, Plan, Ship: a @DirectedAcyclicGraph must have no cycle\n",
        );
        expect(result.stdout).toBe(
          drawnDiagram([
            ...subgraph(0, "Audit", [
              'n0["Audit"]',
              'n1["Report"]',
              "n0 --> n1",
            ]),
            ...subgraph(1, "Build", [
              'n2["Build"]',
              'n3["Ship"]',
              'n4["Design"]',
              'n5["Plan"]',
              "n2 --> n3",
              "n4 --> n3",
              "n5 --> n2",
              "n5 --> n4",
              "n3 --> n5",
            ]),
            "class n0 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "warns about a self-loop and draws it",
      async () => {
        await source.query(
          "INSERT INTO task_links (id, source, target) VALUES (6, 'Solo', 'Solo')",
        );

        const result = await runRender(["--entities", TASK_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toBe(
          "⚠️ Node Solo has an edge to itself: a @DirectedAcyclicGraph must have no cycle\n",
        );
        expect(result.stdout).toContain("n6 --> n6");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws a cycle that no root reaches, even with a depth cap",
      async () => {
        await source.query(
          "INSERT INTO task_links (id, source, target) VALUES (6, 'Loop a', 'Loop b'), (7, 'Loop b', 'Loop a')",
        );

        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--truncate-depth",
          "1",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toContain(
          "⚠️ Cycle among nodes Loop a, Loop b: a @DirectedAcyclicGraph must have no cycle",
        );
        expect(result.stdout).toContain('["Loop a"]');
        expect(result.stdout).toContain('["Loop b"]');
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("--filter and --sort, which apply to the edge rows", () => {
    it(
      "keeps the edges that match every filter, and draws only their nodes",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--filter",
          "source=Plan",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Plan"]',
            'n1["Build"]',
            'n2["Design"]',
            "n0 --> n1",
            "n0 --> n2",
            "class n0 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "filters on the weight column with a comparison",
      async () => {
        await source.query("UPDATE task_links SET weight = 5 WHERE id = 5");
        await source.query("UPDATE task_links SET weight = 1 WHERE id = 1");

        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--filter",
          "weight>2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Audit"]',
            'n1["Report"]',
            'n0 -->|"5"| n1',
            "class n0 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "orders the edges, and so the siblings, by --sort",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--sort",
          "target:desc",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            ...subgraph(0, "Plan", [
              'n0["Build"]',
              'n1["Ship"]',
              'n2["Design"]',
              'n5["Plan"]',
              "n0 --> n1",
              "n2 --> n1",
              "n5 --> n2",
              "n5 --> n0",
            ]),
            ...subgraph(1, "Audit", [
              'n3["Audit"]',
              'n4["Report"]',
              "n3 --> n4",
            ]),
            "class n3 root",
            "class n5 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "fails before connecting when a filter names a column the edge entity lacks",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--filter",
          "nope=1",
        ]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain('names no column "nope"');
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("--truncate-depth and --truncate-breadth", () => {
    it(
      "collapses the levels below --truncate-depth into '… K more' nodes with warnings",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--truncate-depth",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            ...subgraph(0, "Audit", [
              'n0["Audit"]',
              'n1["Report"]',
              "n0 --> n1",
            ]),
            ...subgraph(1, "Plan", [
              'n2["Build"]',
              'n3["Design"]',
              'n4["Plan"]',
              'n5["… 1 more"]',
              'n6["… 1 more"]',
              "n4 --> n2",
              "n4 --> n3",
              "n2 --> n5",
              "n3 --> n6",
            ]),
            "class n0 root",
            "class n4 root",
            "class n5 truncation",
            "class n6 truncation",
          ]),
        );
        expect(result.stderr).toBe(
          "⚠️ Node Build hides 1 child beyond --truncate-depth 2\n⚠️ Node Design hides 1 child beyond --truncate-depth 2\n",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "measures depth as the shortest distance from a root",
      async () => {
        await source.query(
          "INSERT INTO task_links (id, source, target) VALUES (6, 'Plan', 'Ship')",
        );

        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--truncate-depth",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('["Ship"]');
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "hides the children beyond --truncate-breadth under one '… K more' node",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--truncate-breadth",
          "1",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            ...subgraph(0, "Audit", [
              'n0["Audit"]',
              'n1["Report"]',
              "n0 --> n1",
            ]),
            ...subgraph(1, "Plan", [
              'n2["Build"]',
              'n3["Ship"]',
              'n4["Plan"]',
              'n5["… 1 more"]',
              "n2 --> n3",
              "n4 --> n2",
              "n4 --> n5",
            ]),
            "class n0 root",
            "class n4 root",
            "class n5 truncation",
          ]),
        );
        expect(result.stderr).toBe(
          "⚠️ Node Plan hides 1 child beyond --truncate-breadth 1\n",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("--limit and --page, which page the root nodes", () => {
    it(
      "draws a root and everything reachable from it",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--limit",
          "1",
          "--page",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Build"]',
            'n1["Ship"]',
            'n2["Design"]',
            'n3["Plan"]',
            "n0 --> n1",
            "n2 --> n1",
            "n3 --> n0",
            "n3 --> n2",
            "class n3 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws only the header and warns when the page is past the last root",
      async () => {
        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--limit",
          "1",
          "--page",
          "3",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(drawnDiagram([]));
        expect(result.stderr).toBe(
          "⚠️ Page 3 with --limit 1 is past the last root: the graph has 2 roots in total, so nothing is drawn\n",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  it(
    "keeps a self-loop root's subtree under --limit, so its node is a root",
    async () => {
      await source.query(
        "INSERT INTO task_links (id, source, target) VALUES (6, 'Audit', 'Audit')",
      );

      const result = await runRender([
        "--entities",
        TASK_GLOB,
        "--limit",
        "1",
        "--page",
        "1",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        drawnDiagram([
          'n0["Audit"]',
          'n1["Report"]',
          "n0 --> n0",
          "n0 --> n1",
          "class n0 root",
        ]),
      );
      expect(result.stderr).toContain(
        "Node Audit has an edge to itself: a @DirectedAcyclicGraph must have no cycle",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  describe("output files", () => {
    it(
      "writes the Markdown diagram and the JSON graph, with nothing on stdout",
      async () => {
        const markdown = path.join(
          directory,
          "reports",
          "directed-acyclic-graph.md",
        );
        const json = path.join(directory, "directed-acyclic-graph.json");

        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--output-markdown",
          markdown,
          "--output-json",
          json,
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe("");
        expect(fs.readFileSync(markdown, "utf8")).toBe(
          `\`\`\`mermaid\n${drawnDiagram(DIAMOND_LINES).trimEnd()}\n\`\`\`\n`,
        );

        const model = JSON.parse(fs.readFileSync(json, "utf8")) as GraphModel;

        expect(renderGraphMermaid(model, { direction: "TB" }).diagram).toBe(
          drawnDiagram(DIAMOND_LINES).trimEnd(),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "refuses an existing file without --overwrite, leaving it unchanged",
      async () => {
        const file = path.join(directory, "directed-acyclic-graph.md");
        fs.writeFileSync(file, "keep me");

        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--output-markdown",
          file,
        ]);

        expect(result.exitCode).toBe(1);
        expect(fs.readFileSync(file, "utf8")).toBe("keep me");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "replaces an existing file with --overwrite",
      async () => {
        const file = path.join(directory, "directed-acyclic-graph.md");
        fs.writeFileSync(file, "replace me");

        const result = await runRender([
          "--entities",
          TASK_GLOB,
          "--output-markdown",
          file,
          "--overwrite",
        ]);

        expect(result.exitCode).toBe(0);
        expect(fs.readFileSync(file, "utf8")).toContain("```mermaid");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("credentials", () => {
    it(
      "never shows the password in a failed connection's output",
      async () => {
        const { connection } = source;
        const wrongPassword =
          "wrong-directed-acyclic-graph-fixture-password-1c4e";
        const sourceUri = `postgresql://${connection.username}:${wrongPassword}@${connection.host}:${String(connection.port)}/${connection.database}`;

        const result = await runRender(["--entities", TASK_GLOB], sourceUri);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).not.toContain(wrongPassword);
        expect(result.logs.join("\n")).not.toContain(wrongPassword);
        expect(result.stdout).not.toContain(wrongPassword);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "plans with --dry-run without connecting, never naming the password",
      async () => {
        const secret = "directed acyclic graph-dry-run-fixture-secret-52b7";
        const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

        const result = await runRender(
          ["--entities", TASK_GLOB, "--dry-run"],
          unreachable,
        );

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe("");
        expect(result.logs.join("\n")).toContain(
          "Planning to draw the one @DirectedAcyclicGraph",
        );
        expect(result.logs.join("\n")).toContain("task-link.entity.ts");
        expect(result.logs.join("\n")).not.toContain(secret);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "names the --table it plans to draw in a dry run",
      async () => {
        const result = await runRender([
          "--entities",
          ALL_GLOB,
          "--table",
          "step_links",
          "--dry-run",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.logs.join("\n")).toContain(
          "Planning to draw table step_links",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });
});
