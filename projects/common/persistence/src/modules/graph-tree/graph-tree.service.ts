import { Injectable } from "@nestjs/common";

import { loadTreeGraph } from "./graph-tree-readers.utilities";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
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

  /** Reads the tree `metadata` describes from `dataSource` as a graph model. */
  async load(
    dataSource: DataSource,
    metadata: EntityMetadata,
  ): Promise<GraphModel> {
    return loadTreeGraph(dataSource, metadata);
  }
}
