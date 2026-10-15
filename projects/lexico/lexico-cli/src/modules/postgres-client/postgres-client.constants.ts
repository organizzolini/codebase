// ♟️ Constants

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
