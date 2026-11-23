import { Injectable } from "@nestjs/common";

import { loadTreeGraph } from "./graph-tree-readers.utilities";
import { limitTreeGraph } from "./graph-tree.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type { GraphTreeLimits } from "./graph-tree.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Reads a `@Tree` entity's rows from a database as a graph model, whatever
 * storage the tree uses, for the render commands to draw.
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
   * capped at `limits`; see `limitTreeGraph`.
   */
  async load(
    dataSource: DataSource,
    metadata: EntityMetadata,
    limits: GraphTreeLimits = {},
  ): Promise<GraphModel> {
    return limitTreeGraph(await loadTreeGraph(dataSource, metadata), limits);
  }
}
