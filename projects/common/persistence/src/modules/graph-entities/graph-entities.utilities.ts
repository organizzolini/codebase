// 🌎 Utilities

import { globSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  DataSource,
  getMetadataArgsStorage as getMetadataArgumentsStorage,
} from "typeorm";

import { postgresDataSourceOptions } from "../postgresql/postgresql.utilities";

import {
  GraphEdgeError,
  graphEdgeKindsMessage,
  graphEdgeMissingMessage,
  graphEdgeNoKindMessage,
  graphEdgeRecords,
  graphEdgeSeveralMessage,
  GraphEntitiesError,
  graphGlobMessage,
  graphNoTableMessage,
  graphNoTreeMessage,
  graphSeveralTreesMessage,
} from "./graph-entities.constants";

import type { PostgresConnection } from "../postgresql/postgresql.types";
import type {
  GraphEdgeDeclaration,
  GraphEdgeMetadata,
  GraphEdgeOptions,
  GraphEdgeRecord,
  GraphEdgeRole,
  GraphEntity,
  GraphTreeCandidate,
} from "./graph-entities.types";
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
      entities: [...entities],
      migrations: [],
    }),
  );
}

/** Marks a class a directed acyclic graph, whose edges run from source to target. */
export function DirectedAcyclicGraph(): ClassDecorator {
  return recordDeclaration({ directed: true, kind: "directed-acyclic-graph" });
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
 * @throws GraphEdgeError when it carries none, or both.
 */
export function getGraphEdgeDeclaration(
  entity: GraphEntity,
): GraphEdgeDeclaration {
  const [declaration, ...others] = edgeDeclarationsOf(entity);
  if (declaration === undefined) {
    throw new GraphEdgeError(graphEdgeNoKindMessage(entity.name));
  }
  if (others.length > 0) {
    throw new GraphEdgeError(graphEdgeKindsMessage(entity.name));
  }
  return declaration;
}

/**
 * Describes `entity` from its decorators, up the class chain.
 * @throws GraphEdgeError on a missing, conflicting, or repeated decorator.
 */
export function getGraphEdgeMetadata(entity: GraphEntity): GraphEdgeMetadata {
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

/** Marks a class a graph; it is directed unless `directed` is false. */
export function Graph(options: GraphEdgeOptions = {}): ClassDecorator {
  return recordDeclaration({
    directed: options.directed ?? true,
    kind: "graph",
  });
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

/** The classes among `entities` that carry `@DirectedAcyclicGraph()` or `@Graph()`, inherited or declared. */
export function listGraphEdgeEntities(
  entities: readonly GraphEntity[],
): GraphEntity[] {
  const edges: GraphEntity[] = [];
  for (const entity of entities) {
    if (edgeDeclarationsOf(entity).length > 0) edges.push(entity);
  }
  return edges;
}

/**
 * The one tree entity the command reads; `table` picks among several.
 * @throws GraphEntitiesError when none, or several without `table`, match.
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
    throw new GraphEntitiesError(
      table === undefined
        ? graphNoTreeMessage(globs)
        : graphNoTableMessage(table, tables),
    );
  }
  if (others.length > 0) {
    throw new GraphEntitiesError(
      graphSeveralTreesMessage(picked.map((candidate) => candidate.tableName)),
    );
  }
  return only;
}

/**
 * The absolute path of every file the globs name, sorted and without repeats.
 * @throws GraphEntitiesError naming the first glob that matches no file.
 */
export function resolveEntityFiles(globs: readonly string[]): string[] {
  const files = new Set<string>();

  for (const glob of globs) {
    const matches = globSync(glob, { cwd: process.cwd() });
    if (matches.length === 0) {
      throw new GraphEntitiesError(graphGlobMessage(glob));
    }
    for (const match of matches) files.add(path.resolve(match));
  }

  return [...files].toSorted();
}

/**
 * The `@Tree` entities among `entities`, each with the table its name maps to
 * under `namingStrategy`. Read from the decorator metadata, before any
 * connection opens.
 */
export function treeCandidates(
  entities: readonly GraphEntity[],
  namingStrategy: NamingStrategyInterface,
): GraphTreeCandidate[] {
  return getMetadataArgumentsStorage().trees.flatMap((tree) => {
    const entity = entities.find((candidate) => candidate === tree.target);
    if (entity === undefined) return [];
    return [{ entity, tableName: entityTableName(entity, namingStrategy) }];
  });
}

/** `entity` and each class it extends, nearest first, up to the first class with no base. */
function classChain(entity: GraphEntity): object[] {
  const chain: object[] = [];
  for (
    let target: unknown = entity;
    typeof target === "function" && target !== Function.prototype;
    target = Object.getPrototypeOf(target)
  ) {
    chain.push(target);
  }
  return chain;
}

/** The declarations of the nearest class up the chain that has any. */
function edgeDeclarationsOf(entity: GraphEntity): GraphEdgeDeclaration[] {
  for (const target of classChain(entity)) {
    const declarations = graphEdgeRecords.get(target)?.declarations ?? [];
    if (declarations.length > 0) return declarations;
  }
  return [];
}

/**
 * The property names marked under `role` up the class chain, nearest class
 * first and without repeats, so a redeclared property counts once.
 */
function edgePropertiesOf(entity: GraphEntity, role: GraphEdgeRole): string[] {
  const names = new Set<string>();
  for (const target of classChain(entity)) {
    for (const name of graphEdgeRecords.get(target)?.properties[role] ?? []) {
      names.add(name);
    }
  }
  return [...names];
}

/** A property decorator that names the property under `role` on its class. */
function edgePropertyDecorator(role: GraphEdgeRole): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    edgeRecordOf(target.constructor).properties[role].push(String(propertyKey));
  };
}

/** The edge record for `target`, created empty on its first decorator. */
function edgeRecordOf(target: object): GraphEdgeRecord {
  const existing = graphEdgeRecords.get(target);
  if (existing !== undefined) return existing;

  const created: GraphEdgeRecord = {
    declarations: [],
    properties: {
      GraphLabel: [],
      GraphSource: [],
      GraphTarget: [],
      GraphWeight: [],
    },
  };
  graphEdgeRecords.set(target, created);
  return created;
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

/** A class decorator that records `declaration` on the decorated class. */
function recordDeclaration(declaration: GraphEdgeDeclaration): ClassDecorator {
  return (target: object): void => {
    edgeRecordOf(target).declarations.push(declaration);
  };
}

/**
 * The one property under `role`, which an edge must have.
 * @throws GraphEdgeError when none, or several, are marked.
 */
function requiredEdgeProperty(
  entity: GraphEntity,
  role: GraphEdgeRole,
): string {
  const only = singleEdgeProperty(entity, role);
  if (only === undefined) {
    throw new GraphEdgeError(graphEdgeMissingMessage(entity.name, role));
  }
  return only;
}

/**
 * The one property under `role`, or `undefined` when none is marked.
 * @throws GraphEdgeError when several are marked.
 */
function singleEdgeProperty(
  entity: GraphEntity,
  role: GraphEdgeRole,
): string | undefined {
  const names = edgePropertiesOf(entity, role);
  const [only, ...others] = names;
  if (others.length > 0) {
    throw new GraphEdgeError(
      graphEdgeSeveralMessage(entity.name, role, names.toSorted()),
    );
  }
  return only;
}
