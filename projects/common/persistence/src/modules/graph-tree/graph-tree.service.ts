import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../graph-options/graph-options-columns.utilities";
import { graphColumns } from "../graph-options/graph-options-reads.utilities";
import { GRAPH_BATCH_SIZE } from "../graph-options/graph-options.constants";

import { loadTreeGraph } from "./graph-tree-readers.utilities";
import { limitTreeGraph } from "./graph-tree.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type { GraphTreeOptions } from "./graph-tree.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@Tree` entity's rows from a database as a graph model, whatever
 * storage the tree uses, for the render commands to draw. Rows are read in
 * batches, then filters run, then sort keys, then the root page is cut, then the
 * caps cut the tree.
 */
@Injectable()
export class GraphTreeService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Reads the tree `metadata` describes, filtered, sorted, then capped.
   * @throws GraphOptionsError when a filter or sort names no column, or
   * compares unfit values.
   */
  async load(
    dataSource: DataSource,
    metadata: EntityMetadata,
    options: GraphTreeOptions,
  ): Promise<GraphModel> {
    const view = resolveGraphView(
      graphColumns(dataSource, metadata),
      options.filters,
      options.sorts,
    );
    const graph = await loadTreeGraph(dataSource, metadata, {
      batchSize: options.batchSize ?? GRAPH_BATCH_SIZE,
      paging: options.paging,
      view,
    });
    return limitTreeGraph(graph, options);
  }
}
