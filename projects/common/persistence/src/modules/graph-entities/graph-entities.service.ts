import { Injectable } from "@nestjs/common";

import {
  createGraphDataSource,
  importEntityClasses,
  pickTreeMetadata,
  resolveEntityFiles,
} from "./graph-entities.utilities";

import type { PostgresConnection } from "../postgresql/postgresql.types";
import type { GraphEntity } from "./graph-entities.types";
import type { DataSource, EntityMetadata } from "typeorm";

/**
 * Finds the entity files a graph command's `--entities` globs name, imports
 * their entity classes, and builds the data source over them.
 */
@Injectable()
export class GraphEntitiesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** A data source over `entities` on `connection`, which it does not open. */
  createDataSource(
    connection: PostgresConnection,
    entities: readonly GraphEntity[],
  ): DataSource {
    return createGraphDataSource(connection, entities);
  }

  /** Imports the files the globs name and returns the entity classes they define. */
  async load(globs: readonly string[]): Promise<GraphEntity[]> {
    return importEntityClasses(resolveEntityFiles(globs));
  }

  /**
   * The tree entity `dataSource` holds that the command reads; `table` picks
   * among several. Call after the data source is initialized.
   */
  pickTree(
    dataSource: DataSource,
    table: string | undefined,
    globs: readonly string[],
  ): EntityMetadata {
    return pickTreeMetadata(
      dataSource.entityMetadatas.filter(
        (metadata) => metadata.treeType !== undefined,
      ),
      table,
      globs,
    );
  }

  /**
   * The absolute path of each file the globs name.
   * @throws GraphEntitiesError naming a glob that matches no file.
   */
  resolveFiles(globs: readonly string[]): string[] {
    return resolveEntityFiles(globs);
  }
}
