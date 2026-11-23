// 🌎 Utilities

import {
  GRAPH_TREE_NESTED_SET_ROW_SCHEMA,
  GRAPH_TREE_PARENT_ROW_SCHEMA,
  GRAPH_TREE_PATH_ROW_SCHEMA,
  GRAPH_TREE_PATH_SEPARATOR,
} from "./graph-tree.constants";
import {
  buildTreeGraph,
  nestedSetParents,
  requireTreeMetadata,
} from "./graph-tree.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphTreeReader,
  GraphTreeRow,
  GraphTreeStorage,
  GraphTreeTable,
} from "./graph-tree.types";
import type { DataSource, EntityMetadata } from "typeorm";
import type { z } from "zod";

/**
 * Reads the tree `metadata` describes from `dataSource` as a graph model. The
 * storage named by `@Tree` decides how each row's parent is found: a parent
 * column for adjacency lists and closure tables, the path for materialized
 * paths, and the intervals for nested sets.
 * @throws Error when the entity is not a tree, or lacks the columns its storage needs.
 */
export async function loadTreeGraph(
  dataSource: DataSource,
  metadata: EntityMetadata,
): Promise<GraphModel> {
  const storage = requireTreeMetadata(
    metadata.treeType,
    `${metadata.name} is not a @Tree entity`,
  );

  const table = treeTable(dataSource, metadata);
  return buildTreeGraph(await readerFor(storage)(dataSource, table));
}

/** Escapes a name for SQL, the way the connection's driver quotes it. */
function escapeName(dataSource: DataSource, name: string): string {
  return dataSource.driver.escape(name);
}

/** The parent column a row names as its parent, which TypeORM maintains. */
function parentColumn(metadata: EntityMetadata): string {
  return requireTreeMetadata(
    metadata.treeParentRelation?.joinColumns[0],
    `${metadata.name} is a tree without a @TreeParent relation, so its parents cannot be read`,
  ).databaseName;
}

/** The reader a storage's rows are read by; the rows differ, the graph does not. */
function readerFor(storage: GraphTreeStorage): GraphTreeReader {
  if (storage === "nested-set") return readNestedSetRows;
  if (storage === "materialized-path") return readPathRows;
  return readParentRows;
}

/** Rows placed by their left and right bounds, with the parent each one is nested in. */
async function readNestedSetRows(
  dataSource: DataSource,
  table: GraphTreeTable,
): Promise<GraphTreeRow[]> {
  const { metadata } = table;
  const left = escapeName(
    dataSource,
    requireTreeMetadata(
      metadata.nestedSetLeftColumn,
      `${metadata.name} is a nested-set tree without a left column`,
    ).databaseName,
  );
  const right = escapeName(
    dataSource,
    requireTreeMetadata(
      metadata.nestedSetRightColumn,
      `${metadata.name} is a nested-set tree without a right column`,
    ).databaseName,
  );
  const rows = await selectRows(
    dataSource,
    `SELECT ${table.id}::text AS "id", ${table.label} AS "label", ${left}::text AS "left", ${right}::text AS "right" FROM ${table.from} ORDER BY ${table.id}`,
    GRAPH_TREE_NESTED_SET_ROW_SCHEMA,
  );
  const parents = nestedSetParents(rows);
  return rows.map(({ id, label }) => ({
    id,
    label,
    parentId: parents.get(id),
  }));
}

/** Rows whose parent is a column of their own. */
async function readParentRows(
  dataSource: DataSource,
  table: GraphTreeTable,
): Promise<GraphTreeRow[]> {
  const parent = escapeName(dataSource, parentColumn(table.metadata));
  const rows = await selectRows(
    dataSource,
    `SELECT ${table.id}::text AS "id", ${table.label} AS "label", ${parent}::text AS "parentId" FROM ${table.from} ORDER BY ${table.id}`,
    GRAPH_TREE_PARENT_ROW_SCHEMA,
  );
  return rows.map(({ id, label, parentId }) => ({
    id,
    label,
    parentId: parentId ?? undefined,
  }));
}

/** Rows whose path lists their ancestors' keys, the row's own key last. */
async function readPathRows(
  dataSource: DataSource,
  table: GraphTreeTable,
): Promise<GraphTreeRow[]> {
  const path = requireTreeMetadata(
    table.metadata.materializedPathColumn,
    `${table.metadata.name} is a materialized-path tree without a path column`,
  ).databaseName;
  const rows = await selectRows(
    dataSource,
    `SELECT ${table.id}::text AS "id", ${table.label} AS "label", ${escapeName(dataSource, path)}::text AS "path" FROM ${table.from} ORDER BY ${table.id}`,
    GRAPH_TREE_PATH_ROW_SCHEMA,
  );
  return rows.map(({ id, label, path: keys }) => {
    const ancestors = keys
      .split(GRAPH_TREE_PATH_SEPARATOR)
      .filter((key) => key !== "");
    return { id, label, parentId: ancestors.at(-2) };
  });
}

/** Runs `sql` and checks every row against `schema`. */
async function selectRows<Schema extends z.ZodType>(
  dataSource: DataSource,
  sql: string,
  schema: Schema,
): Promise<z.infer<Schema>[]> {
  const rows: unknown[] = await dataSource.query(sql);
  return rows.map((row) => schema.parse(row));
}

/** The tree table `metadata` describes, with its SQL names escaped. */
function treeTable(
  dataSource: DataSource,
  metadata: EntityMetadata,
): GraphTreeTable {
  const primary = requireTreeMetadata(
    metadata.primaryColumns.length === 1
      ? metadata.primaryColumns[0]
      : undefined,
    `${metadata.name} needs one primary key column to draw its tree`,
  );

  const name = metadata.columns.find(
    (column) => column.propertyName === "name",
  );
  const schema =
    metadata.schema === undefined
      ? ""
      : `${escapeName(dataSource, metadata.schema)}.`;
  const id = escapeName(dataSource, primary.databaseName);
  const label = escapeName(dataSource, (name ?? primary).databaseName);

  return {
    from: `${schema}${escapeName(dataSource, metadata.tableName)}`,
    id,
    label: `COALESCE(${label}::text, ${id}::text)`,
    metadata,
  };
}
