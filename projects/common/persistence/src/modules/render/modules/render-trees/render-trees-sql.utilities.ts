// 🌎 Utilities

import {
  generatedEdgeOf,
  isGraphEntity,
} from "../render-entities/render-entities-generated.utilities";
import { escapeName } from "../render-options/render-options-reads.utilities";

import { RENDER_TREES_PATH_PARENT_PATTERN } from "./render-trees.constants";
import { requireTreeMetadata } from "./render-trees.utilities";

import type { GraphTreeFields } from "../render-options/render-options.types";
import type {
  GraphTreeEdge,
  GraphTreeSql,
  GraphTreeTable,
} from "./render-trees.types";
import type { DataSource, EntityMetadata } from "typeorm";

/** The SQL that reads `table`'s rows by their parents, roots, and columns. */
export function treeSql(
  dataSource: DataSource,
  table: GraphTreeTable,
): GraphTreeSql {
  const parent = parentKeySql(dataSource, table);
  return {
    children: `(${parent}) = ANY($1::text[])`,
    columns: [
      `t.${table.id}::text AS "id"`,
      `${table.label} AS "label"`,
      `(${parent}) AS "parentId"`,
      ...(table.icon === undefined ? [] : [`t.${table.icon}::text AS "icon"`]),
      ...(table.note === undefined ? [] : [`t.${table.note}::text AS "note"`]),
      ...(table.edge === undefined
        ? []
        : [`${otherParentsSql(table, table.edge)} AS "otherParentIds"`]),
    ].join(", "),
    from: `${table.from} t`,
    roots: `(${parent}) IS NULL OR (${parent}) NOT IN (SELECT p.${table.id}::text FROM ${table.from} p)`,
  };
}

/**
 * The tree table `metadata` describes, with SQL names escaped.
 * @throws Error when it is not a tree.
 */
export function treeTable(
  dataSource: DataSource,
  metadata: EntityMetadata,
  fields?: GraphTreeFields,
): GraphTreeTable {
  const edge = graphTreeEdge(dataSource, metadata);
  if (edge === undefined) {
    requireTreeMetadata(
      metadata.treeType,
      `${metadata.name} is not a @Tree entity, nor a @Graph entity whose edges join its own rows`,
    );
  }
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
  const fieldColumn = (property: string | undefined): string | undefined => {
    const column = metadata.columns.find(
      (candidate) => candidate.propertyName === property,
    );
    return column === undefined
      ? undefined
      : escapeName(dataSource, column.databaseName);
  };

  return {
    edge,
    from: `${schema}${escapeName(dataSource, metadata.tableName)}`,
    icon: fieldColumn(fields?.icon),
    id,
    label: `COALESCE(${label}::text, ${id}::text)`,
    metadata,
    note: fieldColumn(fields?.note),
  };
}

/** The SQL giving a row's first parent id of a graph as text: the lowest, so the choice is stable. */
function firstParentSql(table: GraphTreeTable, edge: GraphTreeEdge): string {
  return `SELECT min(f.${edge.source}::text) FROM ${edge.from} f WHERE f.${edge.target} = t.${table.id}`;
}

/**
 * The generated edge table of an entity whose `@Graph` edges join its own rows,
 * with SQL names escaped; none for any other entity.
 */
function graphTreeEdge(
  dataSource: DataSource,
  metadata: EntityMetadata,
): GraphTreeEdge | undefined {
  const { target } = metadata;
  const generated = isGraphEntity(target) ? generatedEdgeOf(target) : undefined;
  if (generated === undefined || generated.nodes !== generated.graph) {
    return undefined;
  }

  const edgeMetadata = dataSource.getMetadata(generated.edge);
  const column = (relation: "source" | "target"): string =>
    escapeName(
      dataSource,
      requireTreeMetadata(
        edgeMetadata.findRelationWithPropertyPath(relation)?.joinColumns[0],
        `${edgeMetadata.name} has no ${relation} relation`,
      ).databaseName,
    );
  const schema =
    edgeMetadata.schema === undefined
      ? ""
      : `${escapeName(dataSource, edgeMetadata.schema)}.`;

  return {
    from: `${schema}${escapeName(dataSource, edgeMetadata.tableName)}`,
    source: column("source"),
    target: column("target"),
  };
}

/** The SQL giving every parent id of a row but its first, as text, in order. */
function otherParentsSql(table: GraphTreeTable, edge: GraphTreeEdge): string {
  return `ARRAY(SELECT o.${edge.source}::text FROM ${edge.from} o WHERE o.${edge.target} = t.${table.id} AND o.${edge.source}::text <> (${firstParentSql(table, edge)}) ORDER BY o.${edge.source}::text)`;
}

/** The SQL giving a row's parent id as text, or NULL for a root. */
function parentKeySql(dataSource: DataSource, table: GraphTreeTable): string {
  const { edge, metadata } = table;
  if (edge !== undefined) return firstParentSql(table, edge);
  if (metadata.treeType === "nested-set") {
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
    return `(SELECT p.${table.id}::text FROM ${table.from} p WHERE p.${left} < t.${left} AND p.${right} > t.${right} ORDER BY p.${left} DESC LIMIT 1)`;
  }
  if (metadata.treeType === "materialized-path") {
    const path = escapeName(
      dataSource,
      requireTreeMetadata(
        metadata.materializedPathColumn,
        `${metadata.name} is a materialized-path tree without a path column`,
      ).databaseName,
    );
    return `substring(t.${path}::text from '${RENDER_TREES_PATH_PARENT_PATTERN}')`;
  }
  const parent = requireTreeMetadata(
    metadata.treeParentRelation?.joinColumns[0],
    `${metadata.name} is a tree without a @TreeParent relation, so its parents cannot be read`,
  ).databaseName;
  return `t.${escapeName(dataSource, parent)}::text`;
}
