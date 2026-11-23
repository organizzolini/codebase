import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../render-options/render-options-columns.utilities";
import { graphColumns } from "../render-options/render-options-reads.utilities";
import { RENDER_BATCH_SIZE } from "../render-options/render-options.constants";

import { loadTreeGraph } from "./render-tree-data-readers.utilities";
import { limitTreeGraph } from "./render-tree-data.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { GraphTreeOptions } from "./render-tree-data.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@Tree` entity's rows from a database as a graph model, whatever
 * storage the tree uses, for the render commands to draw. Rows are read in
 * batches, then filters run, then sort keys, then the root page is cut, then the
 * caps cut the tree.
 */
@Injectable()
export class RenderTreeDataService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Reads the tree `metadata` describes, filtered, sorted, then capped.
   * @throws RenderOptionsError when a filter or sort names no column, or
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
      batchSize: options.batchSize ?? RENDER_BATCH_SIZE,
      paging: options.paging,
      view,
    });
    return limitTreeGraph(graph, options);
  }
}
