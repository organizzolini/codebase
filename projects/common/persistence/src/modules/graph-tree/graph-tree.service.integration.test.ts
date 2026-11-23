import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../testing/fixture-persistence";
import { RenderEntitiesService } from "../render/modules/render-entities/render-entities.service";
import { RenderOptionsService } from "../render/modules/render-options/render-options.service";

import { GraphTreeService } from "./graph-tree.service";

import type { FixtureDatabase } from "../../../testing/fixture-persistence";
import type { GraphTreeOptions } from "./graph-tree.types";

/** The entity files, one per storage type, each in its own glob. */
const TREE_ENTITIES = path.join(
  import.meta.dirname,
  "../../../testing/fixtures/trees",
);
const STORAGES = [
  ["closure-table", path.join(TREE_ENTITIES, "closure-tag.entity.ts")],
  ["materialized-path", path.join(TREE_ENTITIES, "path-tag.entity.ts")],
  ["nested-set", path.join(TREE_ENTITIES, "set-tag.entity.ts")],
  ["adjacency-list", path.join(TREE_ENTITIES, "list-tag.entity.ts")],
] as const;

/** The tables the four storage fixtures read, created per test. */
const TREE_DDL = [
  "DROP TABLE IF EXISTS closure_tags_closure, closure_tags, path_tags, set_tags, list_tags",
  "CREATE TABLE closure_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer REFERENCES closure_tags (id))",
  "CREATE TABLE closure_tags_closure (ancestor_id integer NOT NULL REFERENCES closure_tags (id), descendant_id integer NOT NULL REFERENCES closure_tags (id), PRIMARY KEY (ancestor_id, descendant_id))",
  "CREATE TABLE path_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer REFERENCES path_tags (id), mpath text NOT NULL)",
  "CREATE TABLE set_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer REFERENCES set_tags (id), nsleft integer NOT NULL, nsright integer NOT NULL)",
  "CREATE TABLE list_tags (id integer PRIMARY KEY, name text NOT NULL, parent_id integer)",
];

/** Three roots and their descendants, the same tree in every storage. */
const TREE_ROWS = [
  "INSERT INTO closure_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL), (6, 'Home', NULL), (7, 'Garden', 6)",
  "INSERT INTO closure_tags_closure (ancestor_id, descendant_id) VALUES (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (1, 2), (1, 3), (1, 4), (2, 4), (6, 7)",
  "INSERT INTO path_tags (id, name, parent_id, mpath) VALUES (1, 'Work', NULL, '1.'), (2, 'Email', 1, '1.2.'), (3, 'Meetings', 1, '1.3.'), (4, 'Inbox', 2, '1.2.4.'), (5, 'Errands', NULL, '5.'), (6, 'Home', NULL, '6.'), (7, 'Garden', 6, '6.7.')",
  "INSERT INTO set_tags (id, name, parent_id, nsleft, nsright) VALUES (1, 'Work', NULL, 1, 8), (2, 'Email', 1, 2, 5), (3, 'Meetings', 1, 6, 7), (4, 'Inbox', 2, 3, 4), (5, 'Errands', NULL, 9, 10), (6, 'Home', NULL, 11, 14), (7, 'Garden', 6, 12, 13)",
  "INSERT INTO list_tags (id, name, parent_id) VALUES (1, 'Work', NULL), (2, 'Email', 1), (3, 'Meetings', 1), (4, 'Inbox', 2), (5, 'Errands', NULL), (6, 'Home', NULL), (7, 'Garden', 6)",
];

describe("graph tree service, read in batches", () => {
  let source: FixtureDatabase;
  const renderEntities = new RenderEntitiesService();
  const renderOptions = new RenderOptionsService();
  const graphTree = new GraphTreeService();

  /** Reads the tree `glob` picks from the fixture database with `options`. */
  async function loadTree(
    glob: string,
    options: Partial<GraphTreeOptions> = {},
  ): ReturnType<GraphTreeService["load"]> {
    const { connection } = renderOptions.plan({
      entities: [glob],
      schema: "fixture",
      sourceUri: source.uri,
    });
    const entities = await renderEntities.load([glob]);
    const dataSource = renderEntities.createDataSource(connection, entities);
    await dataSource.initialize();
    try {
      const picked = renderEntities.pickTree({
        entities,
        globs: [glob],
        namingStrategy: dataSource.namingStrategy,
        table: undefined,
      });
      return await graphTree.load(dataSource, dataSource.getMetadata(picked), {
        filters: [],
        sorts: [],
        ...options,
      });
    } finally {
      await dataSource.destroy();
    }
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

  it.each(STORAGES)(
    "reads the %s tree one row per batch exactly as one batch",
    async (_storage, glob) => {
      const batched = await loadTree(glob, { batchSize: 1 });
      const whole = await loadTree(glob);

      expect(batched).toStrictEqual(whole);
      expect(whole.nodes.map(({ label }) => label)).toStrictEqual([
        "Work",
        "Email",
        "Meetings",
        "Inbox",
        "Errands",
        "Home",
        "Garden",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it.each(STORAGES)(
    "pages the %s tree's roots the same whatever the batch size",
    async (_storage, glob) => {
      const paging = { limit: 2, page: 2 };

      const batched = await loadTree(glob, { batchSize: 2, paging });
      const whole = await loadTree(glob, { paging });

      expect(batched).toStrictEqual(whole);
      expect(whole.nodes.map(({ label }) => label)).toStrictEqual([
        "Home",
        "Garden",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it("reads orphan roots and a cycle the same in batches as in one batch", async () => {
    await source.query(
      "INSERT INTO list_tags (id, name, parent_id) VALUES (8, 'Stray', 99), (9, 'Loop a', 10), (10, 'Loop b', 9)",
    );
    const [, listGlob] = STORAGES[3];

    const batched = await loadTree(listGlob, { batchSize: 1 });
    const whole = await loadTree(listGlob);

    expect(batched).toStrictEqual(whole);
    expect(whole.warnings).toStrictEqual([
      "Node 8 names parent 99, which no row has; drawn as a root",
    ]);
    expect(whole.nodes.filter(({ marker }) => marker === "root")).toHaveLength(
      4,
    );
  });
});
