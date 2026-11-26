// 🌎 Utilities

import {
  DataSource,
  getMetadataArgsStorage as getMetadataArgumentsStorage,
} from "typeorm";
import { ConnectionMetadataBuilder } from "typeorm/connection/ConnectionMetadataBuilder.js";

import { PluralSnakeNamingStrategy } from "../postgresql/postgresql.constants";

import {
  POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA,
  POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA,
} from "./postgresql-erd.constants";

import type {
  PostgresqlErdEntityClass,
  PostgresqlErdEntityDetails,
} from "./postgresql-erd.types";
import type { EntityMetadata } from "typeorm";

/**
 * The closure and join tables TypeORM creates for the entities, with foreign
 * keys to their drawn names; none when metadata cannot be built.
 */
export async function readPostgresqlErdDerivedTables(
  entities: readonly PostgresqlErdEntityClass[],
  drawnNames: ReadonlyMap<unknown, string>,
): Promise<PostgresqlErdEntityDetails[]> {
  const dataSource = new DataSource({
    namingStrategy: new PluralSnakeNamingStrategy(),
    type: "postgres",
  });
  let metadatas: EntityMetadata[];

  try {
    metadatas = await new ConnectionMetadataBuilder(
      dataSource,
    ).buildEntityMetadatas([...withRelationTargets(entities)]);
  } catch {
    return [];
  }

  return metadatas
    .filter(({ tableType }) =>
      ["closure-junction", "junction"].includes(tableType),
    )
    .map((metadata) => derivedTable(metadata, drawnNames))
    .toSorted((left, right) => left.tableName.localeCompare(right.tableName));
}

/** One derived table's columns, and a many-to-one relation per foreign key. */
function derivedTable(
  metadata: EntityMetadata,
  drawnNames: ReadonlyMap<unknown, string>,
): PostgresqlErdEntityDetails {
  return {
    columns: metadata.columns.map((column) => ({
      name: column.databaseName,
      nullable: column.isNullable,
      primaryKey: column.isPrimary,
      type: typeof column.type === "function" ? column.type.name : column.type,
    })),
    kind:
      metadata.tableType === "closure-junction"
        ? "closure-table"
        : "join-table",
    name: metadata.tableName,
    relations: metadata.foreignKeys.map((foreignKey) => ({
      cardinality: "many-to-one",
      name: foreignKey.columnNames.join(", "),
      target:
        drawnNames.get(foreignKey.referencedEntityMetadata.target) ??
        foreignKey.referencedEntityMetadata.tableName,
    })),
    tableName: metadata.tableName,
  };
}

/** Whether `owner` is one of the entities, or a base class one extends. */
function isListedOrInherited(
  entities: readonly PostgresqlErdEntityClass[],
  owner: unknown,
): boolean {
  return entities.some(
    (entity) =>
      entity === owner ||
      (typeof owner === "function" && entity.prototype instanceof owner),
  );
}

/** The entities, and each class their relations point at, once each. */
function withRelationTargets(
  entities: readonly PostgresqlErdEntityClass[],
): Set<PostgresqlErdEntityClass> {
  const listed = new Set(entities);

  for (const { target: owner, type } of getMetadataArgumentsStorage()
    .relations) {
    if (!isListedOrInherited(entities, owner)) continue;
    const resolver = POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA.safeParse(type);
    const target: unknown = resolver.success
      ? Reflect.apply(resolver.data, undefined, [])
      : undefined;
    const parsed = POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA.safeParse(target);

    if (parsed.success) listed.add(parsed.data);
  }

  return listed;
}
