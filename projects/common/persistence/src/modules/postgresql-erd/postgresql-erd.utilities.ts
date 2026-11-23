import { glob } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getMetadataArgsStorage as getMetadataArgumentsStorage } from "typeorm";
import { z } from "zod";

import {
  POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA,
  POSTGRESQL_ERD_MODEL_SCHEMA,
  POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA,
} from "./postgresql-erd.constants";

import type {
  PostgresqlErdEntityClass,
  PostgresqlErdEntityDetails,
  PostgresqlErdMetadataStorage,
  PostgresqlErdModel,
} from "./postgresql-erd.types";

/**
 * Imports matched files and returns validated entity metadata, adding external
 * relation targets as name-only entities.
 */
export async function readPostgresqlErdModel(
  fileGlobs: string[],
): Promise<PostgresqlErdModel> {
  const files = await findEntityFiles(fileGlobs);

  if (files.length === 0) {
    throw new Error("No entity file globs were provided.");
  }

  const entities = await importEntityFiles(files);

  if (entities.length === 0) {
    throw new Error(
      `No exported @Entity classes found in matched files for globs: ${fileGlobs.join(", ")}`,
    );
  }

  const storage = getMetadataArgumentsStorage();
  const entityModels = entities.map((entity) =>
    getEntityModel(entity, storage),
  );
  const entityNames = new Set(
    entityModels.flatMap(({ name, tableName }) => [name, tableName]),
  );
  const externalEntityNames = new Set<string>();

  for (const entity of entityModels) {
    for (const relation of entity.relations) {
      if (!entityNames.has(relation.target)) {
        externalEntityNames.add(relation.target);
      }
    }
  }

  return POSTGRESQL_ERD_MODEL_SCHEMA.parse({
    entities: [
      ...entityModels,
      ...[...externalEntityNames].toSorted().map((name) => ({ name })),
    ],
  });
}

/**
 * Finds each glob's resolved files and rejects a pattern that matched nothing.
 */
async function findEntityFiles(fileGlobs: string[]): Promise<string[]> {
  const files = new Set<string>();

  for (const pattern of fileGlobs) {
    const matches: string[] = [];

    for await (const file of glob(pattern)) {
      matches.push(path.resolve(file));
    }

    if (matches.length === 0) {
      throw new Error(`No files matched entity glob "${pattern}".`);
    }

    for (const match of matches) {
      files.add(match);
    }
  }

  return [...files].toSorted();
}

/**
 * Reads column metadata from an entity and each of its base classes.
 */
function getEntityColumns(
  targets: PostgresqlErdEntityClass[],
  storage: PostgresqlErdMetadataStorage,
): PostgresqlErdEntityDetails["columns"] {
  return storage.columns
    .filter(({ target }) => {
      const parsedTarget = POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.safeParse(target);

      return parsedTarget.success && targets.includes(parsedTarget.data);
    })
    .map((column) => {
      const type: unknown = column.options.type;
      const parsedType = z
        .union([z.string(), POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA])
        .parse(type);

      return {
        name: column.options.name ?? column.propertyName,
        nullable: column.options.nullable ?? false,
        primaryKey: column.options.primary ?? false,
        type: typeof parsedType === "string" ? parsedType : parsedType.name,
      };
    })
    .toSorted(
      (left, right) =>
        Number(right.primaryKey) - Number(left.primaryKey) ||
        left.name.localeCompare(right.name),
    );
}

/**
 * Builds one entity record from TypeORM's decorator metadata.
 */
function getEntityModel(
  entity: PostgresqlErdEntityClass,
  storage: PostgresqlErdMetadataStorage,
): PostgresqlErdEntityDetails {
  const targets = getEntityTargets(entity);

  return {
    columns: getEntityColumns(targets, storage),
    name: entity.name,
    relations: getEntityRelations(targets, storage),
    tableName:
      storage.tables.find(({ target }) => target === entity)?.name ??
      entity.name,
  };
}

/**
 * Reads relation cardinality and targets without traversing referenced entities.
 */
function getEntityRelations(
  targets: PostgresqlErdEntityClass[],
  storage: PostgresqlErdMetadataStorage,
): PostgresqlErdEntityDetails["relations"] {
  return storage.relations
    .filter(({ target }) => {
      const parsedTarget = POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.safeParse(target);

      return parsedTarget.success && targets.includes(parsedTarget.data);
    })
    .map((relation) => ({
      cardinality: relation.relationType,
      name: relation.propertyName,
      target: getRelationTarget(relation.type),
    }))
    .toSorted((left, right) => left.name.localeCompare(right.name));
}

/**
 * Lists an entity and its base classes for inherited decorator lookup.
 */
function getEntityTargets(
  entity: PostgresqlErdEntityClass,
): PostgresqlErdEntityClass[] {
  const targets: PostgresqlErdEntityClass[] = [];
  let target: unknown = entity;

  while (isEntityClass(target) && target !== Function.prototype) {
    targets.push(target);
    target = Object.getPrototypeOf(target);
  }

  return targets;
}

/**
 * Resolves the class name returned by a relation target callback.
 */
function getRelationTarget(
  relationType: PostgresqlErdMetadataStorage["relations"][number]["type"],
): string {
  const relationTarget: unknown = relationType;
  const parsedTarget = z
    .union([z.string(), POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA])
    .parse(relationTarget);

  if (typeof parsedTarget === "string") {
    return parsedTarget;
  }

  const target: unknown = Reflect.apply(parsedTarget, undefined, []);

  return POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.parse(target).name;
}

/**
 * Imports every matched file and keeps only its exported decorated entity classes.
 */
async function importEntityFiles(
  files: string[],
): Promise<PostgresqlErdEntityClass[]> {
  const storage = getMetadataArgumentsStorage();
  const entities: PostgresqlErdEntityClass[] = [];

  for (const file of files) {
    const imported = z
      .record(z.string(), z.unknown())
      .parse(await import(pathToFileURL(file).href));

    for (const value of Object.values(imported)) {
      if (
        typeof value === "function" &&
        storage.tables.some(({ target }) => target === value)
      ) {
        entities.push(POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.parse(value));
      }
    }
  }

  return [...new Set(entities)].toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );
}

/**
 * Narrows decorator targets to class constructors.
 */
function isEntityClass(value: unknown): value is PostgresqlErdEntityClass {
  return typeof value === "function";
}
