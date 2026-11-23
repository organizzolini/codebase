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
  GraphEntitiesError,
  graphGlobMessage,
  graphNoTableMessage,
  graphNoTreeMessage,
  graphSeveralTreesMessage,
} from "./graph-entities.constants";

import type { PostgresConnection } from "../postgresql/postgresql.types";
import type { GraphEntity, GraphTreeCandidate } from "./graph-entities.types";
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

/**
 * The entity classes `files` define, found by importing each file through the
 * process's module loader, which runs the repository's swc hook for TypeScript.
 * A class counts when it carries `@Entity`.
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
 * The one tree entity the command reads. `table` picks among several by table
 * name; without it, the candidates must be exactly one.
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
  const storage = getMetadataArgumentsStorage();
  return storage.trees.flatMap((tree) => {
    const entity = entities.find((candidate) => candidate === tree.target);
    if (entity === undefined) return [];
    const [table] = storage.filterTables(entity);
    return [
      {
        entity,
        tableName: namingStrategy.tableName(entity.name, table?.name),
      },
    ];
  });
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
