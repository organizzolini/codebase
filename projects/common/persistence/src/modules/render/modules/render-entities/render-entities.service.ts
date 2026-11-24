import { Injectable } from "@nestjs/common";

import { assertGraphColumnNames } from "../render-options/render-options-columns.utilities";

import {
  edgeCandidates,
  pickEdgeCandidate,
} from "./render-entities-edges.utilities";
import {
  createGraphDataSource,
  entityColumnNames,
  getGraphEdgeMetadata,
  importEntityClasses,
  pickTreeCandidate,
  resolveEntityFiles,
  treeCandidates,
} from "./render-entities.utilities";

import type { PostgresConnection } from "../../../postgresql/postgresql.types";
import type {
  GraphFilter,
  GraphPlan,
  GraphSort,
} from "../render-options/render-options.types";
import type {
  GraphEdgeKind,
  GraphEdgeMetadata,
  GraphEdgePick,
  GraphEdgeTarget,
  GraphEntity,
  GraphTreePick,
  GraphTreeTarget,
} from "./render-entities.types";
import type { DataSource } from "typeorm";

/**
 * Finds the entity files a graph command's `--entities` globs name, imports
 * their entity classes, and builds the data source over them.
 */
@Injectable()
export class RenderEntitiesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Passes when every filter and sort names a column `entity` declares, before
   * connecting.
   * @throws RenderOptionsError naming the first missing column.
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
   * How `entity` is described by its `@DirectedAcyclicGraph` or `@Graph` decorators.
   * @throws RenderEntitiesEdgeError on a missing, conflicting, or repeated decorator.
   */
  describeEdge(entity: GraphEntity): GraphEdgeMetadata {
    return getGraphEdgeMetadata(entity);
  }

  /** Imports the files the globs name and returns the entity classes they define. */
  async load(globs: readonly string[]): Promise<GraphEntity[]> {
    return importEntityClasses(resolveEntityFiles(globs));
  }

  /** The `@DirectedAcyclicGraph` or `@Graph` entity of one of `kinds` that the command draws; `table` picks among several. */
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
   * The `@Tree` entity the command reads; `table` picks among several.
   * @throws RenderEntitiesError when none, or several without `table`, match.
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
   * Imports the entities, picks the `@Tree` entity to draw, and checks its
   * columns, before any connection opens.
   */
  async prepareTree(plan: GraphPlan): Promise<GraphTreeTarget> {
    const entities = await this.load(plan.entities);
    const dataSource = this.createDataSource(plan.connection, entities);
    const picked = this.pickTree({
      entities,
      globs: plan.entities,
      namingStrategy: dataSource.namingStrategy,
      table: plan.table,
    });
    this.assertColumns(picked, plan.filters, plan.sorts);
    return { dataSource, picked };
  }

  /**
   * The absolute path of each file the globs name.
   * @throws RenderEntitiesError naming a glob that matches no file.
   */
  resolveFiles(globs: readonly string[]): string[] {
    return resolveEntityFiles(globs);
  }
}
