import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../render-options/render-options-columns.utilities";
import { graphColumns } from "../render-options/render-options-reads.utilities";
import { RENDER_BATCH_SIZE } from "../render-options/render-options.constants";

import {
  limitEdgesGraph,
  pageEdgesGraph,
} from "./render-edges-limits.utilities";
import { loadEdgesGraph } from "./render-edges-readers.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { GraphEdgesOptions } from "./render-edges.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@DirectedAcyclicGraph` or `@Graph` entity's edges from a database as a graph model,
 * for the render commands to draw. Edges are read in batches, filtered and sorted by
 * their own columns, then the root page is cut, then the caps cut the graph.
 */
@Injectable()
export class RenderEdgesService {
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
      batchSize: options.batchSize ?? RENDER_BATCH_SIZE,
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
