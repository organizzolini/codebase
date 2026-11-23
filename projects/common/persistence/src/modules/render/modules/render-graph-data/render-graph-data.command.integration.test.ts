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
const ROUTE_GLOB = path.join(GRAPHS, "route-link.entity.ts");
const GRAPH_LINK_GLOB = path.join(GRAPHS, "graph-link.entity.ts");
const TASK_GLOB = path.join(GRAPHS, "task-link.entity.ts");
const ALL_GLOB = path.join(GRAPHS, "*.entity.ts");

/** The tables the edge fixtures read, created per test. */
const GRAPH_DDL = [
  "DROP TABLE IF EXISTS route_links, graph_links, task_links, step_links, broken_links",
  "CREATE TABLE route_links (id integer PRIMARY KEY, source text NOT NULL, target text NOT NULL, label text, weight double precision)",
  "CREATE TABLE graph_links (id integer PRIMARY KEY, source text NOT NULL, target text NOT NULL)",
  "CREATE TABLE task_links (id integer PRIMARY KEY, source text NOT NULL, target text NOT NULL, label text, weight double precision)",
  "CREATE TABLE step_links (id integer PRIMARY KEY, source integer NOT NULL, target integer NOT NULL)",
  "CREATE TABLE broken_links (id integer PRIMARY KEY, target text NOT NULL)",
];

/** A directed diamond of routes, and two separate undirected links. */
const GRAPH_ROWS = [
  "INSERT INTO route_links (id, source, target) VALUES (1, 'Hub', 'North'), (2, 'Hub', 'South'), (3, 'North', 'Far'), (4, 'South', 'Far')",
  "INSERT INTO graph_links (id, source, target) VALUES (1, 'A', 'B'), (2, 'Y', 'X')",
  "INSERT INTO task_links (id, source, target) VALUES (1, 'Plan', 'Design'), (2, 'Plan', 'Build'), (3, 'Design', 'Ship'), (4, 'Build', 'Ship'), (5, 'Audit', 'Report')",
  "INSERT INTO step_links (id, source, target) VALUES (1, 1, 2), (2, 2, 3)",
];

/** The two lines every diagram opens with after its direction. */
const CLASS_DEFINITIONS = [
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
];

/** The diagram of `lines`, indented under its header, as stdout holds it. */
const drawnDiagram = (lines: readonly string[], direction = "LR"): string =>
  [
    `flowchart ${direction}`,
    ...CLASS_DEFINITIONS,
    ...lines.map((line) => `    ${line}`),
    "",
  ].join("\n");

/** The directed diamond, its edges in source then target order. */
const DIAMOND_LINES = [
  'n0["Hub"]',
  'n1["North"]',
  'n2["South"]',
  'n3["Far"]',
  "n0 --> n1",
  "n0 --> n2",
  "n1 --> n3",
  "n2 --> n3",
  "class n0 root",
];

describe("render-graph-data", () => {
  let source: FixtureDatabase;
  let directory: string;

  /**
   * Runs `render-graph-data` through the real command line against the fixture
   * database, resolving unqualified names in the `fixture` schema.
   */
  async function runRender(
    argv: readonly string[],
    sourceUri: string = source.uri,
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: [
        "render-graph-data",
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
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "render-graph-output-"));
    for (const statement of [...GRAPH_DDL, ...GRAPH_ROWS]) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  describe("drawing", () => {
    it(
      "draws a directed graph with arrows, as its expected diagram, with no warnings",
      async () => {
        const result = await runRender(["--entities", ROUTE_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(drawnDiagram(DIAMOND_LINES));
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws an undirected graph with plain links, each component rooted at its smallest node",
      async () => {
        const result = await runRender(["--entities", GRAPH_LINK_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["A"]',
            'n1["B"]',
            'n2["Y"]',
            'n3["X"]',
            "n0 --- n1",
            "n2 --- n3",
            "class n0 root",
            "class n3 root",
          ]),
        );
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "labels an edge with its label and weight, or its weight alone",
      async () => {
        await source.query(
          "UPDATE route_links SET label = 'needs', weight = 2.5 WHERE id = 1",
        );
        await source.query("UPDATE route_links SET weight = 3 WHERE id = 2");

        const result = await runRender(["--entities", ROUTE_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('n0 -->|"needs (2.5)"| n1');
        expect(result.stdout).toContain('n0 -->|"3"| n2');
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws a cyclic graph with no warning, its cycle's nodes included",
      async () => {
        await source.query(
          "INSERT INTO route_links (id, source, target) VALUES (5, 'Far', 'Hub')",
        );

        const result = await runRender(["--entities", ROUTE_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Far"]',
            'n1["Hub"]',
            'n2["North"]',
            'n3["South"]',
            "n0 --> n1",
            "n1 --> n2",
            "n1 --> n3",
            "n2 --> n0",
            "n3 --> n0",
            "class n0 root",
          ]),
        );
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "keeps a self-loop root's subtree under --limit, so its node is a root",
      async () => {
        await source.query(
          "INSERT INTO route_links (id, source, target) VALUES (5, 'Loop', 'Loop'), (6, 'Loop', 'Tail')",
        );

        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--limit",
          "1",
          "--page",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Loop"]',
            'n1["Tail"]',
            "n0 --> n0",
            "n0 --> n1",
            "class n0 root",
          ]),
        );
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("links and self-loops", () => {
    it(
      "does not make the node a self-loop reaches a root, so the page past the one root draws nothing",
      async () => {
        await source.query(
          "INSERT INTO route_links (id, source, target) VALUES (5, 'Zed', 'Zed'), (6, 'Zed', 'Alpha')",
        );

        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--filter",
          "source=Zed",
          "--limit",
          "1",
          "--page",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(drawnDiagram([]));
        expect(result.stderr).toContain(
          "Page 2 with --limit 1 is past the last root: the graph has 1 root in total, so nothing is drawn",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "spends an undirected node's --truncate-breadth on its children, not on the node it was reached from",
      async () => {
        await source.query(
          "INSERT INTO graph_links (id, source, target) VALUES (3, 'B', 'C')",
        );

        const result = await runRender([
          "--entities",
          GRAPH_LINK_GLOB,
          "--truncate-breadth",
          "1",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["A"]',
            'n1["B"]',
            'n2["C"]',
            'n3["Y"]',
            'n4["X"]',
            "n0 --- n1",
            "n1 --- n2",
            "n3 --- n4",
            "class n0 root",
            "class n4 root",
          ]),
        );
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws an undirected link read from both ends once, from its first row",
      async () => {
        await source.query(
          "INSERT INTO graph_links (id, source, target) VALUES (3, 'B', 'A')",
        );

        const result = await runRender(["--entities", GRAPH_LINK_GLOB]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["A"]',
            'n1["B"]',
            'n2["Y"]',
            'n3["X"]',
            "n0 --- n1",
            "n2 --- n3",
            "class n0 root",
            "class n3 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("shared options", () => {
    it(
      "keeps only the edges --filter matches, and draws the nodes they touch",
      async () => {
        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--filter",
          "source=Hub",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Hub"]',
            'n1["North"]',
            'n2["South"]',
            "n0 --> n1",
            "n0 --> n2",
            "class n0 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "orders edges, and so siblings, by --sort",
      async () => {
        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--sort",
          "target:desc",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Hub"]',
            'n1["South"]',
            'n2["North"]',
            'n3["Far"]',
            "n0 --> n1",
            "n0 --> n2",
            "n2 --> n3",
            "n1 --> n3",
            "class n0 root",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "measures --truncate-depth from the nearest root and collapses the levels below it",
      async () => {
        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--truncate-depth",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Hub"]',
            'n1["North"]',
            'n2["South"]',
            'n3["… 1 more"]',
            'n4["… 1 more"]',
            "n0 --> n1",
            "n0 --> n2",
            "n1 --> n3",
            "n2 --> n4",
            "class n0 root",
            "class n3 truncation",
            "class n4 truncation",
          ]),
        );
        expect(result.stderr).toContain(
          "Node North hides 1 child beyond --truncate-depth 2",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "hides the children beyond --truncate-breadth under one truncation node",
      async () => {
        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--truncate-breadth",
          "1",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram([
            'n0["Hub"]',
            'n1["North"]',
            'n2["Far"]',
            'n3["… 1 more"]',
            "n0 --> n1",
            "n1 --> n2",
            "n0 --> n3",
            "class n0 root",
            "class n3 truncation",
          ]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws one page of --limit start nodes, the undirected components in turn",
      async () => {
        const result = await runRender([
          "--entities",
          GRAPH_LINK_GLOB,
          "--limit",
          "1",
          "--page",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(
          drawnDiagram(['n0["Y"]', 'n1["X"]', "n0 --- n1", "class n1 root"]),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "warns and draws nothing for a page past the last start node",
      async () => {
        const result = await runRender([
          "--entities",
          GRAPH_LINK_GLOB,
          "--limit",
          "1",
          "--page",
          "3",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(drawnDiagram([]));
        expect(result.stderr).toContain(
          "Page 3 with --limit 1 is past the last root: the graph has 2 roots in total, so nothing is drawn",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "writes the Markdown diagram and the JSON graph, with nothing on stdout",
      async () => {
        const markdown = path.join(directory, "reports", "graph.md");
        const json = path.join(directory, "graph.json");

        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
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

        expect(model.directed).toBe(true);
        expect(renderGraphMermaid(model, { direction: "LR" }).diagram).toBe(
          drawnDiagram(DIAMOND_LINES).trimEnd(),
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "refuses an existing output file without --overwrite, leaving it unchanged",
      async () => {
        const file = path.join(directory, "graph.md");
        fs.writeFileSync(file, "keep me");

        const result = await runRender([
          "--entities",
          ROUTE_GLOB,
          "--output-markdown",
          file,
        ]);

        expect(result.exitCode).toBe(1);
        expect(fs.readFileSync(file, "utf8")).toBe("keep me");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  describe("picking the entity", () => {
    it(
      "rejects a @DirectedAcyclicGraph entity, pointing to render-directed-acyclic-graph-data",
      async () => {
        const result = await runRender(["--entities", TASK_GLOB]);

        expect(result.exitCode).toBe(1);
        expect(result.stdout).toBe("");
        expect(result.stderr).toContain(
          "task_links is not drawn by render-graph-data; use render-directed-acyclic-graph-data instead",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "fails naming every @Graph table when several match and --table is not given",
      async () => {
        const result = await runRender(["--entities", ALL_GLOB]);

        expect(result.exitCode).toBe(1);
        expect(result.stdout).toBe("");
        expect(result.stderr).toContain(
          "Several @Graph entities match --entities: graph_links, route_links; name one with --table",
        );
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it(
      "draws the @Graph table --table names beside a @DirectedAcyclicGraph entity",
      async () => {
        const result = await runRender([
          "--entities",
          ALL_GLOB,
          "--table",
          "route_links",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(drawnDiagram(DIAMOND_LINES));
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
  });

  describe("credentials", () => {
    it(
      "never shows the password in a failed connection's output",
      async () => {
        const { connection } = source;
        const wrongPassword = "wrong-graph-fixture-password-8d21";
        const sourceUri = `postgresql://${connection.username}:${wrongPassword}@${connection.host}:${String(connection.port)}/${connection.database}`;

        const result = await runRender(["--entities", ROUTE_GLOB], sourceUri);

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
        const secret = "graph-dry-run-fixture-secret-e9a3";
        const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

        const result = await runRender(
          ["--entities", ROUTE_GLOB, "--dry-run"],
          unreachable,
        );

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe("");
        expect(result.logs.join("\n")).toContain(
          "Planning to draw the one @Graph entity",
        );
        expect(result.logs.join("\n")).toContain("route-link.entity.ts");
        expect(result.logs.join("\n")).not.toContain(secret);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });
});
