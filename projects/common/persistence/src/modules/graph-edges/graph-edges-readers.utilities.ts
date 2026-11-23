// 🌎 Utilities

import { GraphEdgeError } from "../graph-entities/graph-entities.constants";
import {
  filterClause,
  sortClause,
} from "../graph-options/graph-options-columns.utilities";
import {
  escapeName,
  selectPages,
} from "../graph-options/graph-options-reads.utilities";

import {
  GRAPH_EDGES_ROW_SCHEMA,
  graphEdgesColumnMessage,
  graphEdgesIgnoredMessage,
} from "./graph-edges.constants";
import { buildEdgeGraph } from "./graph-edges.utilities";

import type { GraphEdgeMetadata } from "../graph-entities/graph-entities.types";
import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type { GraphView } from "../graph-options/graph-options.types";
import type { GraphEdgesEdge, GraphEdgesTable } from "./graph-edges.types";
import type { DataSource, EntityMetadata } from "typeorm";
import type { z } from "zod";

/**
 * The edge table `metadata` describes, each declared column resolved and escaped.
 * @throws GraphEdgeError when a declared property is no column.
 */
export function edgeTable(
  dataSource: DataSource,
  metadata: EntityMetadata,
  edge: GraphEdgeMetadata,
): GraphEdgesTable {
  const columnOf = (decorator: string, property: string): string => {
    const column = metadata.columns.find(
      ({ propertyName }) => propertyName === property,
    );
    if (column === undefined) {
      throw new GraphEdgeError(
        graphEdgesColumnMessage({
          columns: metadata.columns.map(({ propertyName }) => propertyName),
          decorator,
          entity: metadata.name,
          property,
        }),
      );
    }
    return escapeName(dataSource, column.databaseName);
  };

  const schema =
    metadata.schema === undefined
      ? ""
      : `${escapeName(dataSource, metadata.schema)}.`;
  const { labelColumn, weightColumn } = edge;
  return {
    keys: metadata.primaryColumns.map(({ databaseName }) =>
      escapeName(dataSource, databaseName),
    ),
    ...(labelColumn === undefined
      ? {}
      : { label: columnOf("GraphLabel", labelColumn) }),
    source: columnOf("GraphSource", edge.sourceColumn),
    table: `${schema}${escapeName(dataSource, metadata.tableName)}`,
    target: columnOf("GraphTarget", edge.targetColumn),
    ...(weightColumn === undefined
      ? {}
      : { weight: columnOf("GraphWeight", weightColumn) }),
  };
}

/** Reads the edges `view` keeps, batch by batch, as a graph. NULL endpoints are warned about and not drawn. */
export async function loadEdgesGraph(
  dataSource: DataSource,
  metadata: EntityMetadata,
  {
    batchSize,
    edge,
    view,
  }: {
    readonly batchSize: number;
    readonly edge: GraphEdgeMetadata;
    readonly view: GraphView;
  },
): Promise<GraphModel> {
  const { body, parameters } = edgeReadSql(
    edgeTable(dataSource, metadata, edge),
    view,
  );
  const rows = await selectPages(dataSource, {
    batchSize,
    body,
    parameters,
    schema: GRAPH_EDGES_ROW_SCHEMA,
  });

  const edges = rows.flatMap((row) => rowEdge(row));
  const graph = buildEdgeGraph(edges, edge);
  const ignored = rows.length - edges.length;
  if (ignored === 0) return graph;
  return {
    ...graph,
    warnings: [graphEdgesIgnoredMessage(ignored), ...graph.warnings],
  };
}

/** The columns an edge is read by; a weight that is not finite reads as NULL. */
function edgeColumnsSql(table: GraphEdgesTable): string {
  const label =
    table.label === undefined ? "NULL::text" : `t.${table.label}::text`;
  const weight =
    table.weight === undefined
      ? "NULL::float8"
      : `CASE WHEN (t.${table.weight}::float8 - t.${table.weight}::float8) = 0 THEN t.${table.weight}::float8 END`;
  return `t.${table.source}::text AS "source", t.${table.target}::text AS "target", ${label} AS "label", ${weight} AS "weight"`;
}

/** The query body for the edges `view` keeps, ordered by its sorts, then source, target, and primary key. */
function edgeReadSql(
  table: GraphEdgesTable,
  view: GraphView,
): { readonly body: string; readonly parameters: string[] } {
  const { parameters, sql } = filterClause(view.filters);
  const where = sql === "" ? "" : ` WHERE ${sql}`;
  const orders = [
    ...(view.sorts.length > 0 ? [sortClause(view.sorts)] : []),
    ...[table.source, table.target, ...table.keys].map((name) => `t.${name}`),
  ];
  return {
    body: `SELECT ${edgeColumnsSql(table)} FROM ${table.table} t${where} ORDER BY ${orders.join(", ")}`,
    parameters,
  };
}

/** The edge a row holds, or none when an endpoint is NULL; a NULL label or weight is left off. */
function rowEdge({
  label,
  source,
  target,
  weight,
}: z.infer<typeof GRAPH_EDGES_ROW_SCHEMA>): GraphEdgesEdge[] {
  if (source === null || target === null) return [];
  return [
    {
      ...(label === null ? {} : { label }),
      source,
      target,
      ...(weight === null ? {} : { weight }),
    },
  ];
}
