import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../graph-options/graph-options-columns.utilities";
import { graphColumns } from "../graph-options/graph-options-reads.utilities";
import { GRAPH_BATCH_SIZE } from "../graph-options/graph-options.constants";

import {
  limitEdgesGraph,
  pageEdgesGraph,
} from "./graph-edges-limits.utilities";
import { loadEdgesGraph } from "./graph-edges-readers.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type { GraphEdgesOptions } from "./graph-edges.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@DirectedAcyclicGraph` or `@Graph` entity's edges from a database as a graph model,
 * for the render commands to draw. Edges are read in batches, filtered and sorted by
 * their own columns, then the root page is cut, then the caps cut the graph.
 */
@Injectable()
export class GraphEdgesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads a `@DirectedAcyclicGraph` entity's edges as a graph, filtered, sorted, paged, then capped. */
  async load(
    dataSource: DataSource,
    metadata: EntityMetadata,
    options: GraphEdgesOptions,
  ): Promise<GraphModel> {
    const view = resolveGraphView(
      graphColumns(dataSource, metadata),
      options.filters,
      options.sorts,
    );
    const graph = await loadEdgesGraph(dataSource, metadata, {
      batchSize: options.batchSize ?? GRAPH_BATCH_SIZE,
      edge: options.edge,
      view,
    });
    return limitEdgesGraph(
      options.paging === undefined
        ? graph
        : pageEdgesGraph(graph, options.paging),
      options,
    );
  }
}
