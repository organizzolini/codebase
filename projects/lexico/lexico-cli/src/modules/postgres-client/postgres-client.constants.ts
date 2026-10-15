// ♟️ Constants

import { z } from "zod";

import type {
  PostgresClientFailure,
  PostgresClientTool,
} from "./postgres-client.types";

/** What a masked password reads as in logs and surfaced errors. */
export const MASKED_PASSWORD = "****";

/** The URI schemes libpq accepts. */
export const POSTGRES_URI_PROTOCOLS: readonly string[] = [
  "postgres:",
  "postgresql:",
];

/**
 * The most a client tool may print before Node kills it; listing the
 * contents of a large dump runs to megabytes.
 */
export const POSTGRES_CLIENT_MAXIMUM_BUFFER_BYTES = 64 * 1024 * 1024;

/** The only major version of the client tools this CLI accepts. */
export const POSTGRES_CLIENT_MAJOR_VERSION = 18;

/** The script that installs the PostgreSQL client tools locally. */
export const POSTGRES_CLIENT_SETUP_SCRIPT =
  "scripts/local/software/database.sh";

/** Reads the major version from a client tool's `--version` output. */
export const POSTGRES_VERSION_PATTERN = /\(PostgreSQL\)\s+(\d+)/u;

/** Every libpq connection variable starts with this. */
export const POSTGRES_ENVIRONMENT_PREFIX = "PG";

/** Matches the password of any `postgres(ql)://user:password@` URI. */
export const POSTGRES_URI_PASSWORD_PATTERN =
  /(postgres(?:ql)?:\/\/[^:/@\s]*:)[^@\s]*@/giu;

/**
 * A PostgreSQL client tool that failed, carrying its own error text with
 * credentials masked.
 */
export class PostgresClientError extends Error {
  constructor({ code, detail, tool }: PostgresClientFailure) {
    super(
      typeof code === "number"
        ? `${tool} failed with exit code ${String(code)}: ${detail}`
        : `${tool} could not be run: ${detail}`,
    );
    this.name = PostgresClientError.name;
    this.code = code;
    this.detail = detail;
    this.tool = tool;
  }
  readonly code: number | string | undefined;
  readonly detail: string;
  readonly tool: PostgresClientTool;
}

/**
 * A PostgreSQL client tool that is missing, cannot be run, or is not major
 * version 18. Every message names the setup script that installs it.
 */
export class PostgresClientToolError extends Error {
  constructor(tool: PostgresClientTool, problem: string) {
    super(
      `${tool} ${problem}. Install the PostgreSQL ${String(POSTGRES_CLIENT_MAJOR_VERSION)} client tools by running ${POSTGRES_CLIENT_SETUP_SCRIPT}.`,
    );
    this.name = PostgresClientToolError.name;
    this.tool = tool;
  }
  readonly tool: PostgresClientTool;
}

/**
 * The error code Postgres raises for a truncate of a table that a table
 * outside the same statement references, among other unsupported features.
 */
export const POSTGRES_FEATURE_NOT_SUPPORTED = "0A000";

/**
 * Lists the tables outside `$1`, a `regclass[]`, whose foreign keys
 * reference a table inside it, schema-qualified and sorted.
 */
export const POSTGRES_REFERENCING_TABLES_SQL = `SELECT DISTINCT namespace.nspname || '.' || referencing.relname AS "table"
FROM pg_catalog.pg_constraint AS foreign_key
JOIN pg_catalog.pg_class AS referencing ON referencing.oid = foreign_key.conrelid
JOIN pg_catalog.pg_namespace AS namespace ON namespace.oid = referencing.relnamespace
WHERE foreign_key.contype = 'f'
  AND foreign_key.confrelid = ANY ($1::regclass[])
  AND NOT foreign_key.conrelid = ANY ($1::regclass[])
ORDER BY 1`;

/** The rows `POSTGRES_REFERENCING_TABLES_SQL` resolves. */
export const POSTGRES_REFERENCING_TABLES_SCHEMA = z.array(
  z.object({ table: z.string() }),
);

/**
 * A truncate Postgres refused because tables outside it reference the
 * tables inside it. The failed statement truncated nothing.
 */
export class PostgresReferencedTablesError extends Error {
  constructor(referencing: readonly string[]) {
    super(
      `Cannot truncate the selected tables: ${referencing.join(", ")} reference them`,
    );
    this.name = PostgresReferencedTablesError.name;
    this.referencing = referencing;
  }

  /** The schema-qualified tables to add to the truncate, sorted. */
  readonly referencing: readonly string[];
}

/**
 * A truncate that could not connect or run, carrying the driver's own
 * error text with credentials masked. The truncate did not take effect.
 */
export class PostgresTruncateError extends Error {
  constructor(detail: string) {
    super(`Truncate failed: ${detail}`);
    this.name = PostgresTruncateError.name;
  }
}

/**
 * A connection URI, given as a command-line option, that could not be
 * used. Its message names the option and never repeats the URI, which may
 * carry a password.
 */
export class PostgresUriError extends Error {
  constructor(option: string, reason: string) {
    super(`${option} ${reason}`);
    this.name = PostgresUriError.name;
  }
}

/** Reads a `pg_restore --list` entry line: its dump id, then what it is. */
export const POSTGRES_DUMP_ENTRY_PATTERN = /^(\d+);\s+\d+\s+\d+\s+(.*)$/u;

/** Reads the ids a `pg_restore --list --verbose` entry depends on. */
export const POSTGRES_DUMP_DEPENDENCIES_PATTERN = /^;\s+depends on:\s*(.*)$/u;

/** The entries every restore runs, which set up the session. */
export const POSTGRES_DUMP_HEADER_PATTERN =
  /^(ENCODING|SEARCHPATH|STDSTRINGS) /u;

/** A table's definition, but not a partition's `TABLE ATTACH`. */
export const POSTGRES_DUMP_TABLE_PATTERN = /^TABLE (?!ATTACH )(.*)$/u;

/** A table's rows. */
export const POSTGRES_DUMP_TABLE_DATA_PATTERN = /^TABLE DATA (.*)$/u;

/**
 * What `pg_dump --strict-names` prints for each `--table` that matches
 * nothing, capturing the pattern it was given.
 */
export const POSTGRES_DUMP_MISSING_TABLE_PATTERN =
  /no matching tables were found for pattern "([^"]+)"/gu;
