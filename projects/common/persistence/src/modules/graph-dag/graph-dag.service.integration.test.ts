import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  FIXTURE_DATABASE_TIMEOUT_MILLISECONDS,
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  startFixtureDatabase,
} from "../../../testing/fixture-persistence";
import { GraphEntitiesService } from "../graph-entities/graph-entities.service";
import { GraphOptionsService } from "../graph-options/graph-options.service";

import { GraphDagService } from "./graph-dag.service";

import type { FixtureDatabase } from "../../../testing/fixture-persistence";
import type { GraphDagOptions } from "./graph-dag.types";

/** The task edge entity, which reads the `task_links` table. */
const TASK_GLOB = path.join(
  import.meta.dirname,
  "../../../testing/fixtures/graphs/task-link.entity.ts",
);

/** The edge table, with label and weight, created per test. */
const DDL = [
  "DROP TABLE IF EXISTS task_links",
  "CREATE TABLE task_links (id integer PRIMARY KEY, source text, target text, label text, weight double precision)",
];

/** A diamond with a label and weights, and an Audit edge. */
const ROWS = [
  "INSERT INTO task_links (id, source, target, label, weight) VALUES (1, 'Plan', 'Design', 'needs', 1.5), (2, 'Plan', 'Build', NULL, NULL), (3, 'Design', 'Ship', NULL, 2), (4, 'Build', 'Ship', NULL, NULL), (5, 'Audit', 'Report', NULL, NULL)",
];

describe("graph dag service, read in batches", () => {
  let source: FixtureDatabase;
  const graphEntities = new GraphEntitiesService();
  const graphOptions = new GraphOptionsService();
  const graphDag = new GraphDagService();

  /** Reads the DAG the task entity describes from the fixture database with `options`. */
  async function loadDag(
    options: Partial<Omit<GraphDagOptions, "edge">> = {},
  ): ReturnType<GraphDagService["load"]> {
    const { connection } = graphOptions.plan({
      entities: [TASK_GLOB],
      schema: "fixture",
      sourceUri: source.uri,
    });
    const entities = await graphEntities.load([TASK_GLOB]);
    const dataSource = graphEntities.createDataSource(connection, entities);
    await dataSource.initialize();
    try {
      const picked = graphEntities.pickEdge({
        command: "render-dag-data",
        entities,
        globs: [TASK_GLOB],
        kinds: ["dag"],
        namingStrategy: dataSource.namingStrategy,
        table: undefined,
      });
      return await graphDag.load(dataSource, dataSource.getMetadata(picked), {
        edge: graphEntities.describeEdge(picked),
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
    for (const statement of [...DDL, ...ROWS]) {
      await source.query(statement);
    }
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await source.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "reads the edges one row per batch exactly as one batch",
    async () => {
      const batched = await loadDag({ batchSize: 1 });
      const whole = await loadDag();

      expect(batched).toStrictEqual(whole);
      expect(whole.edges).toStrictEqual([
        { source: "Audit", target: "Report" },
        { source: "Build", target: "Ship" },
        { source: "Design", target: "Ship", weight: 2 },
        { source: "Plan", target: "Build" },
        { label: "needs", source: "Plan", target: "Design", weight: 1.5 },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "pages the roots the same whatever the batch size",
    async () => {
      const paging = { limit: 1, page: 2 };

      const batched = await loadDag({ batchSize: 2, paging });
      const whole = await loadDag({ paging });

      expect(batched).toStrictEqual(whole);
      expect(whole.nodes.map(({ label }) => label)).toStrictEqual([
        "Build",
        "Ship",
        "Design",
        "Plan",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "orders edges with equal sort keys by source and target, whatever the batch size",
    async () => {
      await source.query("UPDATE task_links SET label = 'same'");
      const sorts = [
        { column: "label", direction: "asc", expression: "label" },
      ] as const;

      const batched = await loadDag({ batchSize: 1, sorts });
      const whole = await loadDag({ sorts });

      expect(batched).toStrictEqual(whole);
      expect(whole.edges.map(({ source }) => source)).toStrictEqual([
        "Audit",
        "Build",
        "Design",
        "Plan",
        "Plan",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "leaves out an edge with a NULL endpoint, with one warning",
    async () => {
      await source.query(
        "INSERT INTO task_links (id, source, target) VALUES (6, NULL, 'Ship'), (7, 'Plan', NULL)",
      );

      const graph = await loadDag();

      expect(graph.edges).toHaveLength(5);
      expect(graph.warnings).toStrictEqual([
        "2 edges have a NULL source or target, so they are not drawn",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "warns about a single NULL endpoint in the singular",
    async () => {
      await source.query(
        "INSERT INTO task_links (id, source, target) VALUES (6, 'Plan', NULL)",
      );

      const graph = await loadDag();

      expect(graph.warnings).toStrictEqual([
        "1 edge has a NULL source or target, so it is not drawn",
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "reads a weight that is not finite as none",
    async () => {
      await source.query("UPDATE task_links SET weight = 'NaN' WHERE id = 3");
      await source.query(
        "UPDATE task_links SET weight = 'Infinity' WHERE id = 5",
      );

      const graph = await loadDag();

      expect(
        graph.edges.filter(({ weight }) => weight !== undefined),
      ).toStrictEqual([
        { label: "needs", source: "Plan", target: "Design", weight: 1.5 },
      ]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
