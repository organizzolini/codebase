// 🌎 Utilities

import { singleEdgeProperty } from "../render-entities/render-entities-records.utilities";
import { RenderEntitiesEdgeError } from "../render-entities/render-entities.constants";
import { escapeName } from "../render-options/render-options-reads.utilities";
import { RENDER_BATCH_SIZE } from "../render-options/render-options.constants";

import {
  RENDER_NODES_ROW_SCHEMA,
  renderNodesColumnMessage,
} from "./render-nodes.constants";

import type { GraphEntity } from "../render-entities/render-entities.types";
import type {
  GraphEdge,
  GraphModel,
  GraphNode,
} from "../render-mermaid/render-mermaid.types";
import type { RenderNodesLabels } from "./render-nodes.types";
import type { DataSource, EntityMetadata } from "typeorm";

/** The distinct edge labels, each the key of the row that titles its neighborhood. */
export function edgeLabels(graph: GraphModel): string[] {
  const labels = new Set<string>();
  for (const { label } of graph.edges) {
    if (label !== undefined) labels.add(label);
  }
  return [...labels];
}

/** The entity the relation over column `property` of `metadata` joins, or `undefined` when it has none. */
export function joinedMetadata(
  metadata: EntityMetadata,
  property: string,
): EntityMetadata | undefined {
  return metadata.relations.find(({ joinColumns }) =>
    joinColumns.some((column) => column.propertyName === property),
  )?.inverseEntityMetadata;
}

/**
 * The query for keys and labels of `$1`'s rows, or `undefined` with no key or label.
 * @throws RenderEntitiesEdgeError for a non-column label.
 */
export function labelSql(
  dataSource: DataSource,
  metadata: EntityMetadata,
): string | undefined {
  const [key, ...others] = metadata.primaryColumns;
  const property = isEntityClass(metadata.target)
    ? singleEdgeProperty(metadata.target, "GraphLabel")
    : undefined;
  if (key === undefined || others.length > 0 || property === undefined) {
    return undefined;
  }

  const label = metadata.columns.find(
    (column) => column.propertyName === property,
  );
  if (label === undefined) {
    throw new RenderEntitiesEdgeError(
      renderNodesColumnMessage({
        columns: metadata.columns.map(({ propertyName }) => propertyName),
        entity: metadata.name,
        property,
      }),
    );
  }
  const schema =
    metadata.schema === undefined
      ? ""
      : `${escapeName(dataSource, metadata.schema)}.`;
  const id = `t.${escapeName(dataSource, key.databaseName)}`;
  return `SELECT ${id}::text AS "id", t.${escapeName(dataSource, label.databaseName)}::text AS "label" FROM ${schema}${escapeName(dataSource, metadata.tableName)} t WHERE ${id}::text = ANY($1::text[])`;
}

/** The ids of the nodes a row backs, which leaves out a truncation node. */
export function nodeIds(graph: GraphModel): string[] {
  const ids: string[] = [];
  for (const { id, marker } of graph.nodes) {
    if (marker !== "truncation") ids.push(id);
  }
  return ids;
}

/** The label of each of `ids` that `sql` reads, in batches; none for a missing row or NULL. */
export async function readLabels(
  dataSource: DataSource,
  sql: string,
  ids: readonly string[],
): Promise<Map<string, string>> {
  const labels = new Map<string, string>();
  for (let start = 0; start < ids.length; start += RENDER_BATCH_SIZE) {
    const rows: unknown[] = await dataSource.query(sql, [
      ids.slice(start, start + RENDER_BATCH_SIZE),
    ]);
    for (const row of rows) {
      const { id, label } = RENDER_NODES_ROW_SCHEMA.parse(row);
      if (label !== null) labels.set(id, label);
    }
  }
  return labels;
}

/** The graph with each node under its label and each edge under its graph's title, where there is one. */
export function relabelGraph(
  graph: GraphModel,
  { nodes, titles }: RenderNodesLabels,
): GraphModel {
  const relabelledEdges: GraphEdge[] = [];
  for (const edge of graph.edges) {
    const title = edge.label === undefined ? undefined : titles.get(edge.label);
    relabelledEdges.push(
      title === undefined ? edge : { ...edge, label: title },
    );
  }
  const relabelledNodes: GraphNode[] = [];
  for (const node of graph.nodes) {
    const label = node.marker === "truncation" ? undefined : nodes.get(node.id);
    relabelledNodes.push(label === undefined ? node : { ...node, label });
  }
  return { ...graph, edges: relabelledEdges, nodes: relabelledNodes };
}

/** Whether `value` is an entity class. */
function isEntityClass(value: unknown): value is GraphEntity {
  return typeof value === "function";
}
