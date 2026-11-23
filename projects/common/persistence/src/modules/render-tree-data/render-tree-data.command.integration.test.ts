import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  postgresUri,
  startFixtureDatabase,
} from "../../../testing/fixture-persistence";

import type { FixtureDatabase } from "../../../testing/fixture-persistence";

/** The fixture tree every storage type holds, drawn with its nodes in id order. */
const TREE_DIAGRAM = [
  "flowchart LR",
  "    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px",
  "    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5",
  '    n0["Work"]',
  '    n1["Email"]',
  '    n2["Meetings"]',
  '    n3["Inbox"]',
  '    n4["Errands"]',
  "    n0 --> n1",
  "    n0 --> n2",
  "    n1 --> n3",
  "    class n0 root",
  "    class n4 root",
  "",
].join("\n");

/** The entity files, one per storage type, each in its own glob. */
const TREE_ENTITIES = path.join(
  import.meta.dirname,
  "../../../testing/fixtures/trees",
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

/** Work > Email > Inbox, Work > Meetings, and Errands alone, in every storage. */
const TREE_ROWS = [
  "INSERT INTO closure_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL)",
  "INSERT INTO closure_tags_closure (ancestor_id, descendant_id) VALUES (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (1, 2), (1, 3), (1, 4), (2, 4)",
  "INSERT INTO path_tags (id, name, parent_id, mpath) VALUES (1, 'Work', NULL, '1.'), (2, 'Email', 1, '1.2.'), (3, 'Meetings', 1, '1.3.'), (4, 'Inbox', 2, '1.2.4.'), (5, 'Errands', NULL, '5.')",
  "INSERT INTO set_tags (id, name, parent_id, nsleft, nsright) VALUES (1, 'Work', NULL, 1, 8), (2, 'Email', 1, 2, 5), (3, 'Meetings', 1, 6, 7), (4, 'Inbox', 2, 3, 4), (5, 'Errands', NULL, 9, 10)",
  "INSERT INTO list_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL)",
  "INSERT INTO code_tags (code, note, parent_code) VALUES ('ops', NULL, NULL), ('ops-db', NULL, 'ops'), ('ops-web', NULL, 'ops')",
];

/** The keyed tree: its labels are its codes, since it has no `name` column. */
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

  it("builds the same URI the fixture reports", () => {
    expect(postgresUri(source.connection)).toBe(source.uri);
  });
});
