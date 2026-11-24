import { Injectable } from "@nestjs/common";

import {
  edgeLabels,
  labelSql,
  nodeIds,
  readLabels,
  relabelGraph,
} from "./render-nodes.utilities";

import type { GraphGeneratedEdge } from "../render-entities/render-entities.types";
import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads the labels a drawn graph is shown under: each node's, from its entity's
 * `@GraphLabel` column, and each neighborhood's title, from its graph entity's.
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
   * The graph with each drawn node under its label, and each edge, which
   * carries its graph's key, under the graph's label.
   */
  async relabel(
    dataSource: DataSource,
    graph: GraphModel,
    { graph: graphEntity, nodes }: GraphGeneratedEdge,
  ): Promise<GraphModel> {
    return relabelGraph(graph, {
      nodes: await this.labels(
        dataSource,
        dataSource.getMetadata(nodes),
        nodeIds(graph),
      ),
      titles: await this.labels(
        dataSource,
        dataSource.getMetadata(graphEntity),
        edgeLabels(graph),
      ),
    });
  }
}
