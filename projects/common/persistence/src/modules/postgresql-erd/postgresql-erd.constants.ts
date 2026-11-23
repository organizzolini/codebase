import { z } from "zod";

// ♟️ Constants

export const POSTGRESQL_ERD_OPTION_MESSAGES = {
  entities: "--entities is required: specify one or more entity file globs",
  output:
    "--output-json and/or --output-markdown is required: specify at least one output path",
} as const;
export const POSTGRESQL_ERD_END_ANCHOR = "<!-- postgresql-erd:end -->";
export const POSTGRESQL_ERD_START_ANCHOR = "<!-- postgresql-erd:start -->";
export const POSTGRESQL_ERD_RELATION_SYMBOLS: Record<
  "many-to-many" | "many-to-one" | "one-to-many" | "one-to-one",
  string
> = {
  "many-to-many": "}o--o{",
  "many-to-one": "}o--||",
  "one-to-many": "||--o{",
  "one-to-one": "||--||",
};
export const POSTGRESQL_ERD_TYPE_MAP: Record<string, string> = {
  bigint: "int",
  bit: "string",
  boolean: "boolean",
  character: "string",
  "character varying": "string",
  date: "date",
  decimal: "float",
  "double precision": "float",
  float: "float",
  float4: "float",
  float8: "float",
  int: "int",
  int2: "int",
  int4: "int",
  int8: "int",
  integer: "int",
  json: "json",
  jsonb: "json",
  number: "float",
  numeric: "float",
  real: "float",
  serial: "int",
  smallint: "int",
  text: "string",
  time: "time",
  timestamp: "date",
  timestamptz: "date",
  "timestamp without time zone": "date",
  "timestamp with time zone": "date",
  "time without time zone": "time",
  "time with time zone": "time",
  uuid: "string",
  varchar: "string",
};

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

/** A checked ERD output differs from its generated content. */
export class PostgresqlErdCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = PostgresqlErdCheckError.name;
  }
}

/** Typed failures raised when ERD CLI options are unusable. */
export class PostgresqlErdOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = PostgresqlErdOptionsError.name;
  }
}
