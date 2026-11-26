// 🌎 Utilities

import { globSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  DataSource,
  getMetadataArgsStorage as getMetadataArgumentsStorage,
} from "typeorm";

import { postgresDataSourceOptions } from "../../../postgresql/postgresql.utilities";

import {
  generatedEdgeOf,
  generatedNamesOf,
  generateEdgeEntity,
  withGeneratedEdges,
} from "./render-entities-generated.utilities";
import {
  edgeDeclarationsOf,
  edgeRecordOf,
  singleEdgeProperty,
} from "./render-entities-records.utilities";
import {
  RenderEntitiesEdgeError,
  renderEntitiesEdgeKindsMessage,
  renderEntitiesEdgeMissingMessage,
  renderEntitiesEdgeNoKindMessage,
  RenderEntitiesError,
  renderEntitiesGlobMessage,
  renderEntitiesNoTableMessage,
  renderEntitiesNoTreeMessage,
  renderEntitiesSeveralTreesMessage,
} from "./render-entities.constants";

import type { PostgresConnection } from "../../../postgresql/postgresql.types";
import type {
  GraphEdgeDeclaration,
  GraphEdgeMetadata,
  GraphEdgeOptions,
  GraphEdgeRole,
  GraphEntity,
  GraphGeneratedNames,
  GraphGeneratedOptions,
  GraphTreeCandidate,
} from "./render-entities.types";
import type { NamingStrategyInterface } from "typeorm";

/**
 * A data source over `entities`, with the connection's schema on its search
 * path. Built from the shared Postgres options, so synchronize stays off.
 */
export function createGraphDataSource(
  connection: PostgresConnection,
  entities: readonly GraphEntity[],
): DataSource {
  return new DataSource(
    postgresDataSourceOptions(connection, {
      entities: withGeneratedEdges(entities),
      migrations: [],
    }),
  );
}

/** Marks a directed acyclic graph. With `edge` and `nodes`, it generates the edge entity. */
export function DirectedAcyclicGraph(
  names?: Partial<GraphGeneratedNames>,
): ClassDecorator {
  return declareGraph(
    { directed: true, kind: "directed-acyclic-graph" },
    generatedNamesOf(names ?? {}, "@DirectedAcyclicGraph"),
  );
}

/**
 * The property names of the columns `entity` declares or inherits, read from
 * decorator metadata before connecting, so `--filter` and `--sort` can name
 * them.
 */
export function entityColumnNames(entity: GraphEntity): string[] {
  const storage = getMetadataArgumentsStorage();
  const names = new Set<string>();
  for (
    let target: unknown = entity;
    isClass(target);
    target = Object.getPrototypeOf(target)
  ) {
    for (const column of storage.filterColumns(target)) {
      names.add(column.propertyName);
    }
  }
  return [...names];
}

/** The unqualified table `entity` maps to under `namingStrategy`, read from its `@Entity`. */
export function entityTableName(
  entity: GraphEntity,
  namingStrategy: NamingStrategyInterface,
): string {
  const [table] = getMetadataArgumentsStorage().filterTables(entity);
  return namingStrategy.tableName(entity.name, table?.name);
}

/**
 * The one `@DirectedAcyclicGraph()` or `@Graph()` declaration `entity` carries, up the class chain.
 * @throws RenderEntitiesEdgeError when it carries none, or both.
 */
export function getGraphEdgeDeclaration(
  entity: GraphEntity,
): GraphEdgeDeclaration {
  const [declaration, ...others] = edgeDeclarationsOf(entity);
  if (declaration === undefined) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesEdgeNoKindMessage(entity.name),
    );
  }
  if (others.length > 0) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesEdgeKindsMessage(entity.name),
    );
  }
  return declaration;
}

/**
 * Describes `source` by its decorators, or its generated edge's.
 * @throws RenderEntitiesEdgeError on bad decorators.
 */
export function getGraphEdgeMetadata(source: GraphEntity): GraphEdgeMetadata {
  const entity = generatedEdgeOf(source)?.edge ?? source;
  const declaration = getGraphEdgeDeclaration(entity);
  const labelColumn = singleEdgeProperty(entity, "GraphLabel");
  const weightColumn = singleEdgeProperty(entity, "GraphWeight");

  return {
    directed: declaration.directed,
    kind: declaration.kind,
    sourceColumn: requiredEdgeProperty(entity, "GraphSource"),
    targetColumn: requiredEdgeProperty(entity, "GraphTarget"),
    ...(labelColumn === undefined ? {} : { labelColumn }),
    ...(weightColumn === undefined ? {} : { weightColumn }),
  };
}

/** Marks a graph, directed unless `directed` is false. With `edge` and `nodes`, it generates the edge entity. */
export function Graph(
  options: GraphEdgeOptions | GraphGeneratedOptions = {},
): ClassDecorator {
  return declareGraph(
    { directed: options.directed ?? true, kind: "graph" },
    generatedNamesOf(options, "@Graph"),
  );
}

/** Marks a property as the label of each edge, optionally. */
export function GraphLabel(): PropertyDecorator {
  return edgePropertyDecorator("GraphLabel");
}

/** Marks a property as the source endpoint of each edge. */
export function GraphSource(): PropertyDecorator {
  return edgePropertyDecorator("GraphSource");
}

/** Marks a property as the target endpoint of each edge. */
export function GraphTarget(): PropertyDecorator {
  return edgePropertyDecorator("GraphTarget");
}

/** Marks a property as the weight of each edge, optionally. */
export function GraphWeight(): PropertyDecorator {
  return edgePropertyDecorator("GraphWeight");
}

/**
 * The entity classes `files` define, imported through the module loader, whose
 * swc hook compiles TypeScript. A class counts when it carries `@Entity`.
 */
export async function importEntityClasses(
  files: readonly string[],
): Promise<GraphEntity[]> {
  const entities = new Set<GraphEntity>();

  for (const file of files) {
    const exported: unknown = await import(pathToFileURL(file).href);
    const values = isRecord(exported) ? Object.values(exported) : [];
    for (const entity of values.filter((value) => isEntityClass(value))) {
      entities.add(entity);
    }
  }

  return [...entities];
}

/**
 * The classes among `entities` that carry `@DirectedAcyclicGraph()` or
 * `@Graph()`, inherited or declared, other than the edge entities they generated.
 */
export function listGraphEdgeEntities(
  entities: readonly GraphEntity[],
): GraphEntity[] {
  const edges: GraphEntity[] = [];
  for (const entity of entities) {
    if (generatedEdgeOf(entity)?.edge === entity) continue;
    if (edgeDeclarationsOf(entity).length > 0) edges.push(entity);
  }
  return edges;
}

/**
 * The one tree entity the command reads; `table` picks among several.
 * @throws RenderEntitiesError when none, or several without `table`, match.
 */
export function pickTreeCandidate<Candidate extends GraphTreeCandidate>(
  candidates: readonly Candidate[],
  table: string | undefined,
  globs: readonly string[],
): Candidate {
  const picked =
    table === undefined
      ? candidates
      : candidates.filter((candidate) => candidate.tableName === table);
  const tables = candidates.map((candidate) => candidate.tableName);

  const [only, ...others] = picked;
  if (only === undefined) {
    throw new RenderEntitiesError(
      table === undefined
        ? renderEntitiesNoTreeMessage(globs)
        : renderEntitiesNoTableMessage(table, tables),
    );
  }
  if (others.length > 0) {
    throw new RenderEntitiesError(
      renderEntitiesSeveralTreesMessage(
        picked.map((candidate) => candidate.tableName),
      ),
    );
  }
  return only;
}

/**
 * The absolute path of every file the globs name, sorted and without repeats.
 * @throws RenderEntitiesError naming the first glob that matches no file.
 */
export function resolveEntityFiles(globs: readonly string[]): string[] {
  const files = new Set<string>();

  for (const glob of globs) {
    const matches = globSync(glob, { cwd: process.cwd() });
    if (matches.length === 0) {
      throw new RenderEntitiesError(renderEntitiesGlobMessage(glob));
    }
    for (const match of matches) files.add(path.resolve(match));
  }

  return [...files].toSorted();
}

/**
 * The `@Tree` entities among `entities`, and those whose generated `@Graph`
 * edge joins their own rows, each with its table under `namingStrategy`.
 */
export function treeCandidates(
  entities: readonly GraphEntity[],
  namingStrategy: NamingStrategyInterface,
): GraphTreeCandidate[] {
  const trees = getMetadataArgumentsStorage().trees.flatMap((tree) => {
    const entity = entities.find((candidate) => candidate === tree.target);
    return entity === undefined ? [] : [entity];
  });
  const graphs = entities.filter((entity) => {
    const generated = generatedEdgeOf(entity);
    return generated?.graph === entity && generated.nodes === entity;
  });

  return [...new Set([...trees, ...graphs])].map((entity) => ({
    entity,
    tableName: entityTableName(entity, namingStrategy),
  }));
}

/**
 * A class decorator that records `declaration` on the decorated class, then
 * generates its edge entity when `names` asks for one.
 */
function declareGraph(
  declaration: GraphEdgeDeclaration,
  names: GraphGeneratedNames | undefined,
): ClassDecorator {
  return (target: object): void => {
    edgeRecordOf(target).declarations.push(declaration);
    if (names !== undefined && isClass(target)) {
      generateEdgeEntity(target, names, declaration);
    }
  };
}

/** A property decorator that names the property under `role` on its class. */
function edgePropertyDecorator(role: GraphEdgeRole): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    edgeRecordOf(target.constructor).properties[role].push(String(propertyKey));
  };
}

/** Whether `value` is a class, not the `Function.prototype` that ends every class chain. */
function isClass(value: unknown): value is GraphEntity {
  return typeof value === "function" && value !== Function.prototype;
}

/** Whether `value` is a class carrying `@Entity`, which TypeORM registers. */
function isEntityClass(value: unknown): value is GraphEntity {
  return getMetadataArgumentsStorage().tables.some(
    (table) => table.target === value,
  );
}

/** Whether `value` is an object, such as a module namespace, whose values can be read. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * The one property under `role`, which an edge must have.
 * @throws RenderEntitiesEdgeError when none, or several, are marked.
 */
function requiredEdgeProperty(
  entity: GraphEntity,
  role: GraphEdgeRole,
): string {
  const only = singleEdgeProperty(entity, role);
  if (only === undefined) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesEdgeMissingMessage(entity.name, role),
    );
  }
  return only;
}
