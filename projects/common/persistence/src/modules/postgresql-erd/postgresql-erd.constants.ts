import { z } from "zod";

// ♟️ Constants

const postgresqlErdColumnSchema = z.object({
  name: z.string(),
  nullable: z.boolean(),
  primaryKey: z.boolean(),
  type: z.string(),
});

const postgresqlErdRelationSchema = z.object({
  cardinality: z.enum([
    "one-to-one",
    "one-to-many",
    "many-to-one",
    "many-to-many",
  ]),
  name: z.string(),
  target: z.string(),
});

const postgresqlErdEntityDetailsSchema = z.object({
  columns: z.array(postgresqlErdColumnSchema),
  name: z.string(),
  relations: z.array(postgresqlErdRelationSchema),
  tableName: z.string(),
});

const postgresqlErdEntityReferenceSchema = z
  .object({ name: z.string() })
  .strict();

export const POSTGRESQL_ERD_ENTITY_CLASS_SCHEMA = z.custom<
  (abstract new (...arguments_: never[]) => object) & {
    readonly name: string;
  }
>((value) => typeof value === "function");

export const POSTGRESQL_ERD_MODEL_SCHEMA = z.object({
  entities: z.array(
    z.union([
      postgresqlErdEntityDetailsSchema,
      postgresqlErdEntityReferenceSchema,
    ]),
  ),
});

export const POSTGRESQL_ERD_RELATION_RESOLVER_SCHEMA = z.custom<
  (...arguments_: never[]) => unknown
>((value) => typeof value === "function");
