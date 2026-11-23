import type { POSTGRESQL_ERD_MODEL_SCHEMA } from "./postgresql-erd.constants";
import type { getMetadataArgsStorage as getMetadataArgumentsStorage } from "typeorm";
import type { z } from "zod";

// 🏷️ Types

/** The options accepted by the `postgresql-erd` command. */
export interface PostgresqlErdCommandOptions {
  check?: boolean;
  entities?: string[];
  outputJson?: string;
  outputMarkdown?: string;
}

/** Validated options, with entity globs and at least one output path. */
export interface PostgresqlErdCommandPlan {
  check: boolean;
  entities: string[];
  outputJson?: string;
  outputMarkdown?: string;
}

/** A TypeORM entity class stored by its decorators. */
export type PostgresqlErdEntityClass = (abstract new (
  ...arguments_: never[]
) => object) & {
  readonly name: string;
  readonly prototype: object;
};

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

/** A generated output file and the format used to check its contents. */
export interface PostgresqlErdOutputFile {
  contents: string;
  path: string;
}
