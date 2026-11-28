import { Injectable } from "@nestjs/common";

import {
  edgeLabels,
  joinedMetadata,
  labelSql,
  nodeIds,
  readLabels,
  relabelGraph,
} from "./render-nodes.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { RenderNodesEdge } from "./render-nodes.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads the labels a drawn graph is shown under: each node's, from its entity's
 * `@GraphLabel` column, and each neighborhood's title, from the entity its edges'
 * label column joins.
 * Only the rows the graph draws are read, never a whole table.
 */
@Injectable()
export class RenderNodesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Each of `ids`' `@GraphLabel` text; missing rows and NULLs are left out.
   * @throws RenderEntitiesEdgeError for a non-column label.
   */
  async labels(
    dataSource: DataSource,
    nodeMetadata: EntityMetadata,
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, string>> {
    const sql = labelSql(dataSource, nodeMetadata);
    return sql === undefined
      ? new Map<string, string>()
      : readLabels(dataSource, sql, ids);
  }

  /**
   * The graph with each node under its label and each edge under its owner's
   * title, read through the entities the edge's relations join.
   */
  async relabel(
    dataSource: DataSource,
    graph: GraphModel,
    { edge, picked }: RenderNodesEdge,
  ): Promise<GraphModel> {
    const metadata = dataSource.getMetadata(picked);
    const nodes = joinedMetadata(metadata, edge.sourceColumn);
    const titled =
      edge.labelColumn === undefined
        ? undefined
        : joinedMetadata(metadata, edge.labelColumn);
    return relabelGraph(graph, {
      nodes:
        nodes === undefined
          ? new Map<string, string>()
          : await this.labels(dataSource, nodes, nodeIds(graph)),
      titles:
        titled === undefined
          ? new Map<string, string>()
          : await this.labels(dataSource, titled, edgeLabels(graph)),
    });
  }
}
