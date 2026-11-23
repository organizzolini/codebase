// 🌎 Utilities

import {
  filterClause,
  sortClause,
} from "../render-options/render-options-columns.utilities";
import { selectPages } from "../render-options/render-options-reads.utilities";

import { loadTreeRows } from "./render-tree-data-batches.utilities";
import { treeSql, treeTable } from "./render-tree-data-sql.utilities";
import { RENDER_TREE_DATA_ID_ROW_SCHEMA } from "./render-tree-data.constants";
import {
  buildTreeGraph,
  keepRowsIn,
  matchedAncestors,
  matchedSubtrees,
  orderRowsByRank,
  pageTreeRows,
} from "./render-tree-data.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type {
  GraphOrder,
  GraphPaging,
  GraphPredicate,
  GraphView,
} from "../render-options/render-options.types";
import type { GraphTreeRow, GraphTreeTable } from "./render-tree-data.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads `metadata`'s tree as a graph model: filtered, sorted, then cut to `paging`.
 * @throws Error when it is not a tree.
 */
export async function loadTreeGraph(
  dataSource: DataSource,
  metadata: EntityMetadata,
  {
    batchSize,
    paging,
    view,
  }: {
    readonly batchSize: number;
    readonly paging: GraphPaging | undefined;
    readonly view: GraphView;
  },
): Promise<GraphModel> {
  const table = treeTable(dataSource, metadata);
  const sql = treeSql(dataSource, table);
  const rows = await loadTreeRows(dataSource, table, { batchSize, sql });
  const filtered =
    view.filters.length > 0
      ? await keepMatchingRows(dataSource, table, {
          batchSize,
          filters: view.filters,
          rows,
        })
      : rows;
  const shaped =
    view.sorts.length > 0
      ? await orderByRank(dataSource, table, {
          batchSize,
          rows: filtered,
          sorts: view.sorts,
        })
      : filtered;
  const paged: {
    readonly rows: readonly GraphTreeRow[];
    readonly warning?: string;
  } = paging === undefined ? { rows: shaped } : pageTreeRows(shaped, paging);

  const graph = buildTreeGraph(paged.rows);
  if (paged.warning === undefined) return graph;
  return { ...graph, warnings: [...graph.warnings, paged.warning] };
}

/** The rows a filter keeps: each match, with its ancestors and subtree. */
async function keepMatchingRows(
  dataSource: DataSource,
  table: GraphTreeTable,
  {
    batchSize,
    filters,
    rows,
  }: {
    readonly batchSize: number;
    readonly filters: readonly GraphPredicate[];
    readonly rows: readonly GraphTreeRow[];
  },
): Promise<GraphTreeRow[]> {
  const { parameters, sql } = filterClause(filters);
  const matches = await selectPages(dataSource, {
    batchSize,
    body: `SELECT t.${table.id}::text AS "id" FROM ${table.from} t WHERE ${sql} ORDER BY t.${table.id}`,
    parameters,
    schema: RENDER_TREE_DATA_ID_ROW_SCHEMA,
  });
  const matched = new Set(matches.map(({ id }) => id));
  const kept = new Set([
    ...matchedAncestors(rows, matched),
    ...matchedSubtrees(rows, matched),
  ]);
  return keepRowsIn(rows, kept);
}

/** The rows in the order the database ranks them by `sorts`, ties by key. */
async function orderByRank(
  dataSource: DataSource,
  table: GraphTreeTable,
  {
    batchSize,
    rows,
    sorts,
  }: {
    readonly batchSize: number;
    readonly rows: readonly GraphTreeRow[];
    readonly sorts: readonly GraphOrder[];
  },
): Promise<GraphTreeRow[]> {
  const ranked = await selectPages(dataSource, {
    batchSize,
    body: `SELECT t.${table.id}::text AS "id" FROM ${table.from} t ORDER BY ${sortClause(sorts)}, t.${table.id}`,
    parameters: [],
    schema: RENDER_TREE_DATA_ID_ROW_SCHEMA,
  });
  return orderRowsByRank(
    rows,
    ranked.map(({ id }) => id),
  );
}
