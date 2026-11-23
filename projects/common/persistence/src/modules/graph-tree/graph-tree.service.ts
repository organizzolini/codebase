import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../graph-options/graph-options-columns.utilities";

import { graphColumns, loadTreeGraph } from "./graph-tree-readers.utilities";
import { limitTreeGraph } from "./graph-tree.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type { GraphTreeOptions } from "./graph-tree.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@Tree` entity's rows from a database as a graph model, whatever
 * storage the tree uses, for the render commands to draw. Filters run first,
 * then sort keys, then the caps cut the filtered, sorted tree.
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
   * Reads the tree `metadata` describes from `dataSource` as a graph model,
   * filtered and sorted by `options`, then capped by them; see `limitTreeGraph`.
   * @throws GraphOptionsError when a filter or sort names no column, or compares unfit values.
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
    const graph = await loadTreeGraph(dataSource, metadata, view);
    return limitTreeGraph(graph, options);
  }
}
