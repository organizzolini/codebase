import { Injectable } from "@nestjs/common";

import {
  createGraphDataSource,
  importEntityClasses,
  pickTreeCandidate,
  resolveEntityFiles,
  treeCandidates,
} from "./graph-entities.utilities";

import type { PostgresConnection } from "../postgresql/postgresql.types";
import type { GraphEntity, GraphTreePick } from "./graph-entities.types";
import type { DataSource } from "typeorm";

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
   * The `@Tree` entity among `entities` that the command reads; `table` picks
   * among several. Picked from the decorators before any connection opens, so
   * a bad pick never reaches the database.
   * @throws GraphEntitiesError when none, or several without `table`, match.
   */
  pickTree({
    entities,
    globs,
    namingStrategy,
    table,
  }: GraphTreePick): GraphEntity {
    return pickTreeCandidate(
      treeCandidates(entities, namingStrategy),
      table,
      globs,
    ).entity;
  }

  /**
   * The absolute path of each file the globs name.
   * @throws GraphEntitiesError naming a glob that matches no file.
   */
  resolveFiles(globs: readonly string[]): string[] {
    return resolveEntityFiles(globs);
  }
}
