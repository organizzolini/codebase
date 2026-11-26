import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import {
  CAELUNDAS_DATABASE_MIGRATIONS,
  DATABASE_ENTITIES,
} from "../../data-source.constants";
import { DatabaseModule } from "../../database.module";

import { MetricExpression } from "./metric-expression.entity";
import { Metric } from "./metric.entity";

import type { DatabaseTestingModule } from "@codebase/persistence/testing";

/** Starting Postgres and running the migration takes longer than a test. */
const CONTAINER_TIMEOUT_MILLISECONDS = 120_000;

/** The columns a catalog table keeps, apart from audit stamps. */
const CATALOG_COLUMNS = ["icon", "name", "note", "slug", "unit"];

/**
 * Reads the measures, the metrics and the expression trees the real migration
 * seeds into a throwaway Postgres, and the closure table that keeps the trees.
 */
describe("measures, metrics and expression trees", () => {
  let database: DatabaseTestingModule;

  /** The columns of a table, apart from its id and audit stamps, sorted. */
  async function readColumns(table: string): Promise<string[]> {
    const rows = await database.dataSource.query<{ name: string }[]>(
      `select column_name as name from information_schema.columns
       where table_schema = current_schema() and table_name = $1
         and column_name not in ('id', 'created_at', 'created_by', 'updated_at', 'updated_by')
       order by column_name`,
      [table],
    );

    return rows.map(({ name }) => name);
  }

  beforeAll(async () => {
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: [...DATABASE_ENTITIES],
      migrations: [...CAELUNDAS_DATABASE_MIGRATIONS],
      project: "caelundas",
    });
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await database.close();
  }, CONTAINER_TIMEOUT_MILLISECONDS);

  it("seeds eighteen measures and eighteen metrics, each metric with a root node", async () => {
    expect.hasAssertions();

    const [counts] = await database.dataSource.query<
      [{ measures: string; metrics: string; roots: string }]
    >(
      `select (select count(*) from measures) as measures,
              (select count(*) from metrics) as metrics,
              (select count(*) from metrics m join metric_expressions e on e.id = m.expression_id where e.parent_id is null) as roots`,
    );

    expect(counts).toStrictEqual({
      measures: "18",
      metrics: "18",
      roots: "18",
    });
  });

  it("keeps measures as a catalog and metrics as a catalog beside their root node", async () => {
    expect.hasAssertions();

    await expect(readColumns("measures")).resolves.toStrictEqual(
      CATALOG_COLUMNS,
    );
    await expect(readColumns("metrics")).resolves.toStrictEqual([
      "expression_id",
      ...CATALOG_COLUMNS,
    ]);
  });

  it("owns no node by a metric: a node reaches a metric only as an operand", async () => {
    expect.hasAssertions();

    await expect(readColumns("metric_expressions")).resolves.toStrictEqual([
      "kind",
      "measure_id",
      "metric_id",
      "operator",
      "parent_id",
      "position",
    ]);
  });

  it("reads a metric's tree through the tree repository, operands in order", async () => {
    expect.hasAssertions();

    const metric = await database.repository(Metric).findOneByOrFail({
      slug: "covered-percent",
    });
    const trees = await database.dataSource
      .getTreeRepository(MetricExpression)
      .findTrees();
    const root = trees.find(({ id }) => id === metric.expressionId);
    const operands = [...(root?.children ?? [])].toSorted(
      (left, right) => left.position - right.position,
    );

    expect(root).toMatchObject({ kind: "operator", operator: "percent" });
    expect(operands).toHaveLength(2);
    expect(operands.map(({ kind }) => kind)).toStrictEqual([
      "measure",
      "measure",
    ]);
  });

  it("points a metric node at another metric through metric_id", async () => {
    expect.hasAssertions();

    const [average, total] = await Promise.all([
      database.repository(Metric).findOneByOrFail({
        slug: "average-duration",
      }),
      database.repository(Metric).findOneByOrFail({ slug: "duration" }),
    ]);
    const [operand] = await database.dataSource.query<[{ metric_id: string }]>(
      `select metric_id from metric_expressions where parent_id = $1 and kind = 'metric'`,
      [average.expressionId],
    );

    expect(operand.metric_id).toBe(total.id);
  });

  it("keeps every node under each of its ancestors in the closure table", async () => {
    expect.hasAssertions();

    const [row] = await database.dataSource.query<[{ missing: string }]>(
      `select count(*) as missing
       from metric_expressions n
       cross join lateral (
         with recursive up as (
           select n.id as id, n.parent_id as parent_id
           union all
           select p.id, p.parent_id from metric_expressions p join up on p.id = up.parent_id
         )
         select id from up
       ) a
       where not exists (
         select 1 from metric_expressions_closure c
         where c.ancestor_id = a.id and c.descendant_id = n.id
       )`,
    );

    expect(row.missing).toBe("0");
  });

  it("refuses two metrics that share a root and a repeated operand place", async () => {
    expect.hasAssertions();

    const [node] = await database.dataSource.query<[{ id: string }]>(
      `select id from metric_expressions where operator = 'percent' limit 1`,
    );

    await expect(
      database.dataSource.query(
        `update metrics set expression_id = (select expression_id from metrics where slug = 'events')
         where slug = 'progressive-events'`,
      ),
    ).rejects.toThrow(/metrics_expression_id/u);
    await expect(
      database.dataSource.query(
        `insert into metric_expressions (parent_id, position, kind, operator)
         values ($1, 0, 'operator', 'add')`,
        [node.id],
      ),
    ).rejects.toThrow(/metric_expressions_parent_position/u);
  });

  it("refuses a node that is not what its kind says", async () => {
    expect.hasAssertions();

    await expect(
      database.dataSource.query(
        `insert into metric_expressions (parent_id, position, kind)
         select id, 9, 'measure' from metric_expressions limit 1`,
      ),
    ).rejects.toThrow(/metric_expressions_kind/u);
  });

  it("has no literal column, and the kind check rejects a literal node", async () => {
    expect.hasAssertions();

    await expect(readColumns("metric_expressions")).resolves.not.toContain(
      "literal",
    );
    await expect(
      database.dataSource.query(
        `insert into metric_expressions (parent_id, position, kind)
         select id, 9, 'literal' from metric_expressions limit 1`,
      ),
    ).rejects.toThrow(/metric_expressions_kind/u);
  });

  it("seeds 28 expression nodes and 38 closure rows, with percent as three nodes each", async () => {
    expect.hasAssertions();

    const [counts] = await database.dataSource.query<
      [{ closure: string; nodes: string; percents: string }]
    >(
      `select (select count(*) from metric_expressions) as nodes,
              (select count(*) from metric_expressions_closure) as closure,
              (select count(*) from metric_expressions where operator = 'percent') as percents`,
    );
    const sizes = await database.dataSource.query<{ size: string }[]>(
      `select count(*) as size from metric_expressions_closure c
       join metric_expressions p on p.id = c.ancestor_id
       where p.operator = 'percent' group by p.id`,
    );

    expect(counts).toStrictEqual({ closure: "38", nodes: "28", percents: "4" });
    expect(sizes.map(({ size }) => size)).toStrictEqual(["3", "3", "3", "3"]);
  });
});
