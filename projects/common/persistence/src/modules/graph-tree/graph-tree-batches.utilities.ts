// 🌎 Utilities

import {
  GRAPH_TREE_ID_ROW_SCHEMA,
  GRAPH_TREE_ROW_SCHEMA,
} from "./graph-tree.constants";
import { orderRowsByRank } from "./graph-tree.utilities";

import type {
  GraphTreeRead,
  GraphTreeRow,
  GraphTreeSql,
  GraphTreeTable,
} from "./graph-tree.types";
import type { DataSource } from "typeorm";
import type { z } from "zod";

/**
 * Splits `values` into consecutive batches of at most `size`, keeping their order.
 */
export function chunkIds<Value>(
  values: readonly Value[],
  size: number,
): Value[][] {
  const batches: Value[][] = [];
  for (let start = 0; start < values.length; start += size) {
    batches.push(values.slice(start, start + size));
  }
  return batches;
}

/**
 * Reads every row of `table` level by level, in batches of `batchSize`.
 * @throws Error when `batchSize` is not a positive integer.
 */
export async function loadTreeRows(
  dataSource: DataSource,
  table: GraphTreeTable,
  {
    batchSize,
    sql,
  }: { readonly batchSize: number; readonly sql: GraphTreeSql },
): Promise<GraphTreeRow[]> {
  const read: GraphTreeRead = {
    batchSize: assertBatchSize(batchSize),
    dataSource,
    sql,
    table,
  };
  const order = await rankIds(read);
  const loaded = await readLevels(read, order);
  return orderRowsByRank([...loaded.values()], order);
}

/**
 * Reads every row `body` selects, a page of `batchSize` at a time.
 * `body` ends in its ORDER BY.
 */
export async function selectPages<Schema extends z.ZodType>(
  dataSource: DataSource,
  {
    batchSize,
    body,
    parameters,
    schema,
  }: {
    readonly batchSize: number;
    readonly body: string;
    readonly parameters: readonly unknown[];
    readonly schema: Schema;
  },
): Promise<z.infer<Schema>[]> {
  const limit = parameters.length + 1;
  const rows: z.infer<Schema>[] = [];
  for (let offset = 0; ; offset += batchSize) {
    const page: unknown[] = await dataSource.query(
      `${body} LIMIT $${String(limit)} OFFSET $${String(limit + 1)}`,
      [...parameters, batchSize, offset],
    );
    for (const row of page) rows.push(schema.parse(row));
    if (page.length < batchSize) return rows;
  }
}

/** Adds each row not yet loaded, returning the ids it added. */
function admitRows(
  loaded: Map<string, GraphTreeRow>,
  rows: readonly z.infer<typeof GRAPH_TREE_ROW_SCHEMA>[],
): string[] {
  const fresh: string[] = [];
  for (const { id, label, parentId } of rows) {
    if (!loaded.has(id)) {
      loaded.set(id, { id, label, parentId: parentId ?? undefined });
      fresh.push(id);
    }
  }
  return fresh;
}

/**
 * `size`, once it is known to be a positive integer.
 * @throws Error naming the size when it is not.
 */
function assertBatchSize(size: number): number {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(
      `batchSize must be a positive integer; got ${String(size)}`,
    );
  }
  return size;
}

/** Every id in the table, in primary-key order: the order a whole read gives. */
async function rankIds(read: GraphTreeRead): Promise<string[]> {
  const { batchSize, dataSource, sql, table } = read;
  const ranked = await selectPages(dataSource, {
    batchSize,
    body: `SELECT t.${table.id}::text AS "id" FROM ${sql.from} ORDER BY t.${table.id}`,
    parameters: [],
    schema: GRAPH_TREE_ID_ROW_SCHEMA,
  });
  return ranked.map(({ id }) => id);
}

/** Reads each level from the roots down, then any row no level reached. */
async function readLevels(
  read: GraphTreeRead,
  order: readonly string[],
): Promise<Map<string, GraphTreeRow>> {
  const { batchSize, dataSource, sql, table } = read;
  const loaded = new Map<string, GraphTreeRow>();
  const roots = await selectPages(dataSource, {
    batchSize,
    body: rowsSql(sql, table, sql.roots),
    parameters: [],
    schema: GRAPH_TREE_ROW_SCHEMA,
  });
  let level = admitRows(loaded, roots);
  while (level.length > 0) {
    const next: string[] = [];
    for (const batch of chunkIds(level, batchSize)) {
      const children = await selectPages(dataSource, {
        batchSize,
        body: rowsSql(sql, table, sql.children),
        parameters: [batch],
        schema: GRAPH_TREE_ROW_SCHEMA,
      });
      for (const id of admitRows(loaded, children)) next.push(id);
    }
    level = next;
  }

  const unreached = order.filter((id) => !loaded.has(id));
  for (const batch of chunkIds(unreached, batchSize)) {
    const found = await selectPages(dataSource, {
      batchSize,
      body: rowsSql(sql, table, `t.${table.id}::text = ANY($1::text[])`),
      parameters: [batch],
      schema: GRAPH_TREE_ROW_SCHEMA,
    });
    admitRows(loaded, found);
  }
  return loaded;
}

/** The query that reads the tree rows `predicate` holds for, in primary-key order. */
function rowsSql(
  sql: GraphTreeSql,
  table: GraphTreeTable,
  predicate: string,
): string {
  return `SELECT ${sql.columns} FROM ${sql.from} WHERE ${predicate} ORDER BY t.${table.id}`;
}
