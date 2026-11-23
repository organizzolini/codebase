import type { POSTGRESQL_ERD_MODEL_SCHEMA } from "./postgresql-erd.constants";
import type { getMetadataArgsStorage as getMetadataArgumentsStorage } from "typeorm";
import type { z } from "zod";

// 🏷️ Types

/** A TypeORM entity class stored by its decorators. */
export type PostgresqlErdEntityClass = (abstract new (
  ...arguments_: never[]
) => object) & { readonly name: string };

/** A full entity record containing its columns and relations. */
export type PostgresqlErdEntityDetails = Extract<
  z.infer<typeof POSTGRESQL_ERD_MODEL_SCHEMA>["entities"][number],
  { columns: unknown }
>;

/** The decorator metadata read without constructing a TypeORM data source. */
export type PostgresqlErdMetadataStorage = ReturnType<
  typeof getMetadataArgumentsStorage
>;

/** A Zod-validated model ready to serialize as JSON. */
export type PostgresqlErdModel = z.infer<typeof POSTGRESQL_ERD_MODEL_SCHEMA>;
