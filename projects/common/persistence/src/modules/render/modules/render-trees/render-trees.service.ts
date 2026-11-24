import { Injectable } from "@nestjs/common";

import { resolveGraphView } from "../render-options/render-options-columns.utilities";
import { graphColumns } from "../render-options/render-options-reads.utilities";
import { RENDER_BATCH_SIZE } from "../render-options/render-options.constants";

import { loadTreeGraph } from "./render-trees-readers.utilities";
import { limitTreeGraph } from "./render-trees.utilities";

import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type {
  GraphColumn,
  GraphSort,
} from "../render-options/render-options.types";
import type { GraphTreeOptions } from "./render-trees.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@Tree` entity's rows from a database as a graph model, whatever
 * storage the tree uses, for the render commands to draw. Rows are read in
 * batches, then filters run, then sort keys, then the root page is cut, then the
 * caps cut the tree.
 */
@Injectable()
export class RenderTreesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The sorts given, else the order field then the name.
   */
  private sortsOf(
    columns: readonly GraphColumn[],
    options: GraphTreeOptions,
  ): readonly GraphSort[] {
    if (options.sorts.length > 0 || options.fields === undefined) {
      return options.sorts;
    }
    const order = options.fields.order;
    if (!columns.some(({ name }) => name === order)) return options.sorts;

    const keys = columns.some(({ name }) => name === "name")
      ? [order, "name"]
      : [order];
    return keys.map((column) => ({
      column,
      direction: "asc",
      expression: column,
    }));
  }

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
    const columns = graphColumns(dataSource, metadata);
    const view = resolveGraphView(
      columns,
      options.filters,
      this.sortsOf(columns, options),
    );
    const graph = await loadTreeGraph(dataSource, metadata, {
      batchSize: options.batchSize ?? RENDER_BATCH_SIZE,
      fields: options.fields,
      paging: options.paging,
      view,
    });
    return limitTreeGraph(graph, options);
  }
}
