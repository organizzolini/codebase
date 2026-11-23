import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  postgresUri,
  startFixtureDatabase,
} from "../../../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../../../testing/fixture-persistence";

/** The fixture tree, drawn with its nodes in id order. */
const TREE_DIAGRAM = [
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
  "",
].join("\n");

/** The entity files, one per storage type, each in its own glob. */
const TREE_ENTITIES = path.join(
  import.meta.dirname,
  "../../../../../testing/fixtures/trees",
);
const CLOSURE_GLOB = path.join(TREE_ENTITIES, "closure-tag.entity.ts");
const PATH_GLOB = path.join(TREE_ENTITIES, "path-tag.entity.ts");
const SET_GLOB = path.join(TREE_ENTITIES, "set-tag.entity.ts");
const LIST_GLOB = path.join(TREE_ENTITIES, "list-tag.entity.ts");
const ALL_GLOB = path.join(TREE_ENTITIES, "*.entity.ts");
const KEYED_GLOB = path.join(TREE_ENTITIES, "keyed", "*.entity.ts");

/** The tables the four storage fixtures read, created and seeded per test. */
const TREE_DDL = [
  "DROP TABLE IF EXISTS closure_tags_closure, closure_tags, path_tags, set_tags, list_tags, code_tags",
  "CREATE TABLE code_tags (code text PRIMARY KEY, note text, parent_code text REFERENCES code_tags (code))",
  "CREATE TABLE closure_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer REFERENCES closure_tags (id))",
  "CREATE TABLE closure_tags_closure (ancestor_id integer NOT NULL REFERENCES closure_tags (id), descendant_id integer NOT NULL REFERENCES closure_tags (id), PRIMARY KEY (ancestor_id, descendant_id))",
  "CREATE TABLE path_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer REFERENCES path_tags (id), mpath text NOT NULL)",
  "CREATE TABLE set_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer REFERENCES set_tags (id), nsleft integer NOT NULL, nsright integer NOT NULL)",
  "CREATE TABLE list_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer)",
];

/** Rows per storage: Work > Email > Inbox, Work > Meetings, Errands. */
const TREE_ROWS = [
  "INSERT INTO closure_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL)",
  "INSERT INTO closure_tags_closure (ancestor_id, descendant_id) VALUES (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (1, 2), (1, 3), (1, 4), (2, 4)",
  "INSERT INTO path_tags (id, name, parent_id, mpath) VALUES (1, 'Work', NULL, '1.'), (2, 'Email', 1, '1.2.'), (3, 'Meetings', 1, '1.3.'), (4, 'Inbox', 2, '1.2.4.'), (5, 'Errands', NULL, '5.')",
  "INSERT INTO set_tags (id, name, parent_id, nsleft, nsright) VALUES (1, 'Work', NULL, 1, 8), (2, 'Email', 1, 2, 5), (3, 'Meetings', 1, 6, 7), (4, 'Inbox', 2, 3, 4), (5, 'Errands', NULL, 9, 10)",
  "INSERT INTO list_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL)",
  "INSERT INTO code_tags (code, note, parent_code) VALUES ('ops', NULL, NULL), ('ops-db', NULL, 'ops'), ('ops-web', NULL, 'ops')",
];

/** The keyed tree, labeled by code, since it has no `name` column. */
const KEYED_DIAGRAM = [
  "flowchart LR",
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
  '    n0["ops"]',
  '    n1["ops-db"]',
  '    n2["ops-web"]',
  "    n0 --> n1",
  "    n0 --> n2",
  "    class n0 root",
  "",
].join("\n");

/** The header every drawn tree opens with, before its nodes and edges. */
const DIAGRAM_HEADER = [
  "flowchart LR",
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
];

/** The diagram of `lines`, indented under the header, as stdout holds it. */
const drawnDiagram = (lines: readonly string[]): string =>
  [...DIAGRAM_HEADER, ...lines.map((line) => `    ${line}`), ""].join("\n");

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

describe("render-tree-data", () => {
  let source: FixtureDatabase;

  /**
   * Runs `render-tree-data` through the real command line against the fixture
   * database, resolving unqualified names in the `fixture` schema.
   */
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
        ...argv,
      ],
    });
  }

  beforeAll(async () => {
    source = await startFixtureDatabase();
  }, FIXTURE_DATABASE_TIMEOUT_MILLISECONDS);

  beforeEach(async () => {
    for (const statement of [...TREE_DDL, ...TREE_ROWS]) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it.each([
    ["closure-table", CLOSURE_GLOB],
    ["materialized-path", PATH_GLOB],
    ["nested-set", SET_GLOB],
    ["adjacency-list", LIST_GLOB],
  ])(
    "draws the %s tree as its expected diagram on stdout",
    async (_storage, glob) => {
      const result = await runRender(["--entities", glob]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(TREE_DIAGRAM);
      expect(result.stderr).toBe("");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "labels a tree without a name column by its primary key, in the schema its entity names",
    async () => {
      const result = await runRender(["--entities", KEYED_GLOB]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(KEYED_DIAGRAM);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "picks one tree among several with --table",
    async () => {
      const result = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "set_tags",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(TREE_DIAGRAM);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails naming every tree table when several match and --table is not given",
    async () => {
      const result = await runRender(["--entities", ALL_GLOB]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        "Several @Tree entities match --entities: closure_tags, path_tags, set_tags, list_tags; name one with --table",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails when --table names a table no tree entity has",
    async () => {
      const result = await runRender([
        "--entities",
        ALL_GLOB,
        "--table",
        "gadgets",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("No @Tree entity has table gadgets");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails naming a glob that matches no file",
    async () => {
      const result = await runRender([
        "--entities",
        path.join(TREE_ENTITIES, "missing-*.entity.ts"),
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("--entities matched no files");
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "draws a row whose parent is missing as a root, warned on stderr, not stdout",
    async () => {
      await source.query(
        "INSERT INTO list_tags (id, name, parent_id) VALUES (6, 'Stray', 99)",
      );

      const result = await runRender(["--entities", LIST_GLOB]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('n5["Stray"]');
      expect(result.stdout).toContain("    class n5 root");
      expect(result.stdout).not.toContain("names parent");
      expect(result.stderr).toBe(
        "⚠️ Node 6 names parent 99, which no row has; drawn as a root\n",
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "never shows the password in a failed connection's output",
    async () => {
      const { connection } = source;
      const wrongPassword = "wrong-fixture-password-7f3a";
      const sourceUri = `postgresql://${connection.username}:${wrongPassword}@${connection.host}:${String(connection.port)}/${connection.database}`;

      const result = await runRender(["--entities", CLOSURE_GLOB], sourceUri);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).not.toContain(wrongPassword);
      expect(result.logs.join("\n")).not.toContain(wrongPassword);
      expect(result.stdout).not.toContain(wrongPassword);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "plans with --dry-run without connecting to any database",
    async () => {
      const secret = "dry-run-fixture-secret-91c2";
      const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

      const result = await runCliCommandLine({
        argv: [
          "render-tree-data",
          "--dry-run",
          "--source-uri",
          unreachable,
          "--schema",
          "fixture",
          "--entities",
          CLOSURE_GLOB,
        ],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.logs.join("\n")).toContain("nothing was connected to");
      expect(result.logs.join("\n")).toContain("closure-tag.entity.ts");
      expect(result.logs.join("\n")).not.toContain(secret);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it("names the --table it plans to draw in a dry run", async () => {
    const result = await runCliCommandLine({
      argv: [
        "render-tree-data",
        "--dry-run",
        "--source-uri",
        source.uri,
        "--schema",
        "fixture",
        "--entities",
        ALL_GLOB,
        "--table",
        "list_tags",
      ],
    });

    expect(result.exitCode).toBe(0);
    expect(result.logs.join("\n")).toContain(
      "Planning to draw table list_tags",
    );
  });

  it.each([
    [
      "--truncate-depth 1 keeps the roots and hides every child beneath them",
      ["--truncate-depth", "1"],
      [
        ...subgraph(0, "Work", ['n0["Work"]', 'n2["… 2 more"]', "n0 --> n2"]),
        ...subgraph(1, "Errands", ['n1["Errands"]']),
        "class n0 root",
        "class n1 root",
        "class n2 truncation",
      ],
      ["Node 1 hides 2 children beyond --truncate-depth 1"],
    ],
    [
      "--truncate-depth 2 keeps two levels and truncates the children of Email",
      ["--truncate-depth", "2"],
      [
        ...subgraph(0, "Work", [
          'n0["Work"]',
          'n1["Email"]',
          'n2["Meetings"]',
          'n4["… 1 more"]',
          "n0 --> n1",
          "n0 --> n2",
          "n1 --> n4",
        ]),
        ...subgraph(1, "Errands", ['n3["Errands"]']),
        "class n0 root",
        "class n3 root",
        "class n4 truncation",
      ],
      ["Node 2 hides 1 child beyond --truncate-depth 2"],
    ],
    [
      "--truncate-breadth 1 shows the first child under Work and truncates the second",
      ["--truncate-breadth", "1"],
      [
        ...subgraph(0, "Work", [
          'n0["Work"]',
          'n1["Email"]',
          'n2["Inbox"]',
          'n4["… 1 more"]',
          "n0 --> n1",
          "n1 --> n2",
          "n0 --> n4",
        ]),
        ...subgraph(1, "Errands", ['n3["Errands"]']),
        "class n0 root",
        "class n3 root",
        "class n4 truncation",
      ],
      ["Node 1 hides 1 child beyond --truncate-breadth 1"],
    ],
    [
      "--truncate-depth 2 with --truncate-breadth 1 applies both caps",
      ["--truncate-depth", "2", "--truncate-breadth", "1"],
      [
        ...subgraph(0, "Work", [
          'n0["Work"]',
          'n1["Email"]',
          'n3["… 1 more"]',
          'n4["… 1 more"]',
          "n0 --> n1",
          "n0 --> n3",
          "n1 --> n4",
        ]),
        ...subgraph(1, "Errands", ['n2["Errands"]']),
        "class n0 root",
        "class n2 root",
        "class n3 truncation",
        "class n4 truncation",
      ],
      [
        "Node 1 hides 1 child beyond --truncate-breadth 1",
        "Node 2 hides 1 child beyond --truncate-depth 2",
      ],
    ],
  ])(
    "caps the drawing: %s",
    async (_description, caps, lines, warnings) => {
      const result = await runRender(["--entities", LIST_GLOB, ...caps]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        [
          "flowchart LR",
          "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
          "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
          ...lines.map((line) => `    ${line}`),
          "",
        ].join("\n"),
      );
      expect(result.stderr).toBe(
        warnings.map((warning) => `⚠️ ${warning}\n`).join(""),
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it.each([
    [
      "--filter name=Inbox keeps the match and its ancestors, not its siblings",
      ["--filter", "name=Inbox"],
      [
        'n0["Work"]',
        'n1["Email"]',
        'n2["Inbox"]',
        "n0 --> n1",
        "n1 --> n2",
        "class n0 root",
      ],
    ],
    [
      "--filter name~=ting keeps the rows whose name contains the text",
      ["--filter", "name~=ting"],
      ['n0["Work"]', 'n1["Meetings"]', "n0 --> n1", "class n0 root"],
    ],
    [
      "--filter name!=Errands drops only the rows named Errands and keeps the rest",
      ["--filter", "name!=Errands"],
      [
        'n0["Work"]',
        'n1["Email"]',
        'n2["Meetings"]',
        'n3["Inbox"]',
        "n0 --> n1",
        "n0 --> n2",
        "n1 --> n3",
        "class n0 root",
      ],
    ],
    [
      "--filter id<3 keeps each match with its ancestors and its whole subtree",
      ["--filter", "id<3"],
      [
        'n0["Work"]',
        'n1["Email"]',
        'n2["Meetings"]',
        'n3["Inbox"]',
        "n0 --> n1",
        "n0 --> n2",
        "n1 --> n3",
        "class n0 root",
      ],
    ],
    [
      "--filter id>4 keeps only the rows above the id, which are roots",
      ["--filter", "id>4"],
      ['n0["Errands"]', "class n0 root"],
    ],
    [
      "--filter name=Meetings keeps the match and its root, as an equal-text match",
      ["--filter", "name=Meetings"],
      ['n0["Work"]', 'n1["Meetings"]', "n0 --> n1", "class n0 root"],
    ],
    [
      "--filter name=Email keeps the match's ancestors and its children, but not its siblings",
      ["--filter", "name=Email"],
      [
        'n0["Work"]',
        'n1["Email"]',
        'n2["Inbox"]',
        "n0 --> n1",
        "n1 --> n2",
        "class n0 root",
      ],
    ],
    [
      "several --filter flags combine with AND",
      ["--filter", "name~=n", "--filter", "id>4"],
      ['n0["Errands"]', "class n0 root"],
    ],
    [
      "--truncate-depth applies to the filtered tree, truncating what the filter kept",
      ["--filter", "name!=Errands", "--truncate-depth", "2"],
      [
        'n0["Work"]',
        'n1["Email"]',
        'n2["Meetings"]',
        'n3["… 1 more"]',
        "n0 --> n1",
        "n0 --> n2",
        "n1 --> n3",
        "class n0 root",
        "class n3 truncation",
      ],
    ],
    [
      "--sort name:desc orders the roots and each sibling group, Z to A",
      ["--sort", "name:desc"],
      [
        ...subgraph(0, "Work", [
          'n0["Work"]',
          'n1["Meetings"]',
          'n2["Inbox"]',
          'n4["Email"]',
          "n0 --> n1",
          "n4 --> n2",
          "n0 --> n4",
        ]),
        ...subgraph(1, "Errands", ['n3["Errands"]']),
        "class n0 root",
        "class n3 root",
      ],
    ],
    [
      "--sort name orders each sibling group A to Z",
      ["--sort", "name"],
      [
        ...subgraph(0, "Work", [
          'n0["Email"]',
          'n2["Inbox"]',
          'n3["Meetings"]',
          'n4["Work"]',
          "n4 --> n0",
          "n0 --> n2",
          "n4 --> n3",
        ]),
        ...subgraph(1, "Errands", ['n1["Errands"]']),
        "class n1 root",
        "class n4 root",
      ],
    ],
  ])(
    "draws the list tree: %s",
    async (_description, argv, lines) => {
      const result = await runRender(["--entities", LIST_GLOB, ...argv]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(drawnDiagram(lines));
      expect(result.stderr).toBe(
        "⚠️ Node 2 hides 1 child beyond --truncate-depth 2\n".repeat(
          argv.includes("--truncate-depth") ? 1 : 0,
        ),
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "applies several --sort keys in order, breaking each tie with the next key",
    async () => {
      await source.query(
        "INSERT INTO list_tags (id, name, parent_id) VALUES (6, 'Email', NULL)",
      );

      const result = await runRender([
        "--entities",
        LIST_GLOB,
        "--sort",
        "name",
        "--sort",
        "id:desc",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(
        drawnDiagram([
          ...subgraph(0, "Email", ['n0["Email"]']),
          ...subgraph(1, "Work", [
            'n1["Email"]',
            'n3["Inbox"]',
            'n4["Meetings"]',
            'n5["Work"]',
            "n5 --> n1",
            "n1 --> n3",
            "n5 --> n4",
          ]),
          ...subgraph(2, "Errands", ['n2["Errands"]']),
          "class n0 root",
          "class n2 root",
          "class n5 root",
        ]),
      );
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it.each([
    [
      "a --filter names a column the entity lacks",
      ["--filter", "gadget=1"],
      '--filter "gadget=1" names no column "gadget"; columns are id, name',
    ],
    [
      "a --sort names a column the entity lacks",
      ["--sort", "gadget:desc"],
      '--sort "gadget:desc" names no column "gadget"; columns are id, name',
    ],
    [
      "a --filter has no operator",
      ["--filter", "name"],
      '--filter "name" must be column<op>value, e.g. --filter name~=Inbox; operators are =, !=, ~= (contains), <, >',
    ],
    [
      "a --sort has an unknown direction",
      ["--sort", "name:up"],
      '--sort "name:up" must be column, column:asc, or column:desc, e.g. --sort name:desc',
    ],
  ])(
    "fails naming the problem before connecting when %s",
    async (_description, argv, message) => {
      const secret = "filter-fixture-secret-6e21";
      const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

      const result = await runRender(
        ["--entities", LIST_GLOB, ...argv],
        unreachable,
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe(`${message}\n`);
      expect(result.stderr).not.toContain("ECONNREFUSED");
      expect(result.stderr).not.toContain(secret);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it.each([
    [
      "< on a text column",
      ["--filter", "name<M"],
      '--filter "name<M" compares with < or >, which needs a numeric or date column; "name" is a text column',
    ],
    [
      "> with a value that is not a number on a numeric column",
      ["--filter", "id>abc"],
      '--filter "id>abc": "abc" is not a number',
    ],
  ])(
    "fails naming the comparison when it is %s",
    async (_description, argv, message) => {
      const result = await runRender(["--entities", LIST_GLOB, ...argv]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe(`${message}\n`);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it.each(["0", "-1", "1.5", "two"])(
    "fails before connecting when --truncate-depth is %s, not a positive integer",
    async (value) => {
      const secret = "cap-fixture-secret-3d8e";
      const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

      const result = await runRender(
        ["--entities", LIST_GLOB, "--truncate-depth", value],
        unreachable,
      );

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(
        `--truncate-depth must be a positive integer, e.g. --truncate-depth 3; got "${value}"`,
      );
      expect(result.stderr).not.toContain(secret);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it("fails with the --truncate-breadth message when it is not a positive integer", async () => {
    const result = await runRender([
      "--entities",
      LIST_GLOB,
      "--truncate-breadth",
      "0",
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      '--truncate-breadth must be a positive integer, e.g. --truncate-breadth 3; got "0"',
    );
  });

  it.each([
    [
      "several trees match and --table is not given",
      ["--entities", ALL_GLOB],
      "Several @Tree entities match --entities",
    ],
    [
      "--table names no tree",
      ["--entities", ALL_GLOB, "--table", "gadgets"],
      "No @Tree entity has table gadgets",
    ],
  ])(
    "reports the pick before connecting when %s",
    async (_description, argv, message) => {
      const secret = "pick-fixture-secret-5b1c";
      const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

      const result = await runRender(argv, unreachable);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(result.stderr).not.toContain("ECONNREFUSED");
      expect(result.stderr).not.toContain(secret);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  describe("paging roots", () => {
    /** The Errands tree alone, the second root in id order. */
    const ERRANDS_DIAGRAM = drawnDiagram(['n0["Errands"]', "class n0 root"]);

    /** The Work subtree, the first root in id order. */
    const WORK_DIAGRAM = drawnDiagram([
      'n0["Work"]',
      'n1["Email"]',
      'n2["Meetings"]',
      'n3["Inbox"]',
      "n0 --> n1",
      "n0 --> n2",
      "n1 --> n3",
      "class n0 root",
    ]);

    it.each([
      ["closure-table", CLOSURE_GLOB],
      ["materialized-path", PATH_GLOB],
      ["nested-set", SET_GLOB],
      ["adjacency-list", LIST_GLOB],
    ])(
      "draws the second root's tree alone with --limit 1 --page 2 in the %s storage",
      async (_storage, glob) => {
        const result = await runRender([
          "--entities",
          glob,
          "--limit",
          "1",
          "--page",
          "2",
        ]);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe(ERRANDS_DIAGRAM);
        expect(result.stderr).toBe("");
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );

    it("draws the first root's subtree with --limit 1 --page 1, roots in id order", async () => {
      const result = await runRender([
        "--entities",
        LIST_GLOB,
        "--limit",
        "1",
        "--page",
        "1",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(WORK_DIAGRAM);
    });

    it("draws every page as its own diagram with --limit 1 and no --page", async () => {
      const result = await runRender(["--entities", LIST_GLOB, "--limit", "1"]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.startsWith(WORK_DIAGRAM.trimEnd())).toBe(true);
      expect(result.stdout.match(/flowchart LR/g)).toHaveLength(2);
    });

    it("draws the same diagram as no paging when --limit covers every root", async () => {
      const result = await runRender([
        "--entities",
        LIST_GLOB,
        "--limit",
        "2",
        "--page",
        "1",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(TREE_DIAGRAM);
    });

    it("pages the roots in --sort order, so the first sorted root comes first", async () => {
      const first = await runRender([
        "--entities",
        LIST_GLOB,
        "--sort",
        "name",
        "--limit",
        "1",
        "--page",
        "1",
      ]);
      const second = await runRender([
        "--entities",
        LIST_GLOB,
        "--sort",
        "name",
        "--limit",
        "1",
        "--page",
        "2",
      ]);

      expect(first.stdout).toBe(ERRANDS_DIAGRAM);
      expect(second.stdout).toBe(
        drawnDiagram([
          'n0["Email"]',
          'n1["Inbox"]',
          'n2["Meetings"]',
          'n3["Work"]',
          "n3 --> n0",
          "n0 --> n1",
          "n3 --> n2",
          "class n3 root",
        ]),
      );
    });

    it("pages the roots that remain after --filter, keeping the matched row's ancestors", async () => {
      const first = await runRender([
        "--entities",
        LIST_GLOB,
        "--filter",
        "name~=Inbox",
        "--limit",
        "1",
        "--page",
        "1",
      ]);
      const second = await runRender([
        "--entities",
        LIST_GLOB,
        "--filter",
        "name~=Inbox",
        "--limit",
        "1",
        "--page",
        "2",
      ]);

      expect(first.stdout).toBe(
        drawnDiagram([
          'n0["Work"]',
          'n1["Email"]',
          'n2["Inbox"]',
          "n0 --> n1",
          "n1 --> n2",
          "class n0 root",
        ]),
      );
      expect(second.exitCode).toBe(0);
      expect(second.stdout).toBe(drawnDiagram([]));
      expect(second.stderr).toBe(
        "⚠️ Page 2 with --limit 1 is past the last root: the tree has 1 root in total, so nothing is drawn\n",
      );
    });

    it("draws only the header and warns when the page is past the last root", async () => {
      const result = await runRender([
        "--entities",
        LIST_GLOB,
        "--limit",
        "1",
        "--page",
        "3",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe(drawnDiagram([]));
      expect(result.stderr).toBe(
        "⚠️ Page 3 with --limit 1 is past the last root: the tree has 2 roots in total, so nothing is drawn\n",
      );
    });

    it.each([
      ["--page without --limit", ["--page", "2"], "--page needs --limit"],
      [
        "a zero --limit",
        ["--limit", "0"],
        "--limit must be a positive integer",
      ],
      [
        "a zero --page",
        ["--limit", "1", "--page", "0"],
        "--page must be a positive integer",
      ],
      [
        "a non-numeric --limit",
        ["--limit", "two"],
        '--limit must be a positive integer, e.g. --limit 3; got "two"',
      ],
    ])(
      "rejects %s before connecting",
      async (_description, flags, message) => {
        const secret = "paging-fixture-secret-3d8e";
        const unreachable = `postgresql://fixture_user:${secret}@127.0.0.1:1/fixture_db`;

        const result = await runRender(
          ["--entities", LIST_GLOB, ...flags],
          unreachable,
        );

        expect(result.exitCode).toBe(1);
        expect(result.stdout).toBe("");
        expect(result.stderr).toContain(message);
        expect(result.stderr).not.toContain("ECONNREFUSED");
        expect(result.stderr).not.toContain(secret);
      },
      INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
    );
  });

  it("builds the same URI the fixture reports", () => {
    expect(postgresUri(source.connection)).toBe(source.uri);
  });
});
