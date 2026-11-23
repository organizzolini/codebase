import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../graph-options/graph-options-columns.utilities";
import { graphColumns } from "../graph-options/graph-options-reads.utilities";
import { GRAPH_BATCH_SIZE } from "../graph-options/graph-options.constants";

import { limitDagGraph, pageDagGraph } from "./graph-dag-limits.utilities";
import { loadDagGraph } from "./graph-dag-readers.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type { GraphDagOptions } from "./graph-dag.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@Dag` or `@Graph` entity's edges from a database as a graph model,
 * for the render commands to draw. Edges are read in batches, filtered and sorted by
 * their own columns, then the root page is cut, then the caps cut the graph.
 */
@Injectable()
export class GraphDagService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads a `@Dag` entity's edges as a graph, filtered, sorted, paged, then capped. */
  async load(
    dataSource: DataSource,
    metadata: EntityMetadata,
    options: GraphDagOptions,
  ): Promise<GraphModel> {
    const view = resolveGraphView(
      graphColumns(dataSource, metadata),
      options.filters,
      options.sorts,
    );
    const graph = await loadDagGraph(dataSource, metadata, {
      batchSize: options.batchSize ?? GRAPH_BATCH_SIZE,
      edge: options.edge,
      view,
    });
    return limitDagGraph(
      options.paging === undefined
        ? graph
        : pageDagGraph(graph, options.paging),
      options,
    );
  }
}
