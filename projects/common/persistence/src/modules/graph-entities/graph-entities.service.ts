import { Injectable } from "@nestjs/common";

import { assertGraphColumnNames } from "../graph-options/graph-options-columns.utilities";

import {
  edgeCandidates,
  pickEdgeCandidate,
} from "./graph-entities-edges.utilities";
import {
  createGraphDataSource,
  entityColumnNames,
  getGraphEdgeMetadata,
  importEntityClasses,
  pickTreeCandidate,
  resolveEntityFiles,
  treeCandidates,
} from "./graph-entities.utilities";

import type {
  GraphFilter,
  GraphPlan,
  GraphSort,
} from "../graph-options/graph-options.types";
import type { PostgresConnection } from "../postgresql/postgresql.types";
import type {
  GraphEdgeKind,
  GraphEdgeMetadata,
  GraphEdgePick,
  GraphEdgeTarget,
  GraphEntity,
  GraphTreePick,
} from "./graph-entities.types";
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

  /**
   * Passes when every filter and sort names a column `entity` declares, read
   * before any connection opens.
   * @throws GraphOptionsError naming the first column the entity lacks.
   */
  assertColumns(
    entity: GraphEntity,
    filters: readonly GraphFilter[],
    sorts: readonly GraphSort[],
  ): void {
    assertGraphColumnNames(entityColumnNames(entity), filters, sorts);
  }

  /** A data source over `entities` on `connection`, which it does not open. */
  createDataSource(
    connection: PostgresConnection,
    entities: readonly GraphEntity[],
  ): DataSource {
    return createGraphDataSource(connection, entities);
  }

  /**
   * How `entity` is described by its `@Dag` or `@Graph` decorators.
   * @throws GraphEdgeError on a missing, conflicting, or repeated decorator.
   */
  describeEdge(entity: GraphEntity): GraphEdgeMetadata {
    return getGraphEdgeMetadata(entity);
  }

  /** Imports the files the globs name and returns the entity classes they define. */
  async load(globs: readonly string[]): Promise<GraphEntity[]> {
    return importEntityClasses(resolveEntityFiles(globs));
  }

  /** The `@Dag` or `@Graph` entity of one of `kinds` that the command draws; `table` picks among several. */
  pickEdge({
    command,
    entities,
    globs,
    kinds,
    namingStrategy,
    table,
  }: GraphEdgePick): GraphEntity {
    return pickEdgeCandidate(edgeCandidates(entities, namingStrategy), {
      command,
      globs,
      kinds,
      table,
    }).entity;
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
   * Imports the entities, picks the one edge entity of `kinds` to draw, and
   * checks its columns, before any connection opens.
   */
  async prepareEdge(
    plan: GraphPlan,
    {
      command,
      kinds,
    }: { readonly command: string; readonly kinds: readonly GraphEdgeKind[] },
  ): Promise<GraphEdgeTarget> {
    const entities = await this.load(plan.entities);
    const dataSource = this.createDataSource(plan.connection, entities);
    const picked = this.pickEdge({
      command,
      entities,
      globs: plan.entities,
      kinds,
      namingStrategy: dataSource.namingStrategy,
      table: plan.table,
    });
    this.assertColumns(picked, plan.filters, plan.sorts);
    return { dataSource, picked };
  }

  /**
   * The absolute path of each file the globs name.
   * @throws GraphEntitiesError naming a glob that matches no file.
   */
  resolveFiles(globs: readonly string[]): string[] {
    return resolveEntityFiles(globs);
  }
}
