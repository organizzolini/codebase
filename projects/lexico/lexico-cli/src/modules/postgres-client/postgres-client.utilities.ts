import { DEFAULT_POSTGRES_PORT } from "@codebase/database";

import {
  MASKED_PASSWORD,
  POSTGRES_ENVIRONMENT_PREFIX,
  POSTGRES_URI_PASSWORD_PATTERN,
  POSTGRES_URI_PROTOCOLS,
  PostgresUriError,
} from "./postgres-client.constants";

import type {
  PostgresContent,
  PostgresUriConnection,
} from "./postgres-client.types";

// 🌎 Utilities

/**
 * Replaces the password of every connection URI in `text`, and `password`
 * itself wherever else it appears, with `****`. Everything logged or
 * surfaced from a client tool passes through here.
 */
export function maskPostgresCredentials(text: string, password = ""): string {
  const masked = text.replaceAll(
    POSTGRES_URI_PASSWORD_PATTERN,
    `$1${MASKED_PASSWORD}@`,
  );

  return password === ""
    ? masked
    : masked.replaceAll(password, MASKED_PASSWORD);
}

/**
 * Parses a `postgresql://user:password@host:port/database` URI given as
 * `option`. A user, a host, and a database are required, the password is
 * optional, and query parameters are refused rather than silently dropped.
 *
 * @throws PostgresUriError naming `option` when any part is missing or
 * unsupported; the message never repeats the URI.
 */
export function parsePostgresUri(
  uri: string,
  option: string,
): PostgresUriConnection {
  const url = URL.parse(uri);
  if (url === null) throw new PostgresUriError(option, "is not a valid URI");

  const problem = postgresUriProblem(url);
  if (problem !== undefined) throw new PostgresUriError(option, problem);

  try {
    return {
      database: decodeURIComponent(url.pathname.slice(1)),
      host: url.hostname,
      password: decodeURIComponent(url.password),
      port: url.port === "" ? DEFAULT_POSTGRES_PORT : Number(url.port),
      username: decodeURIComponent(url.username),
    };
  } catch {
    throw new PostgresUriError(option, "has a malformed percent-encoding");
  }
}

/**
 * The pg_dump or pg_restore flag for `content`: `--data-only`,
 * `--schema-only`, or none when both are wanted, since both tools refuse
 * the two flags together.
 *
 * @throws Error when neither is selected; callers validate that first.
 */
export function postgresContentFlags({
  data,
  schema,
}: PostgresContent): string[] {
  if (data && schema) return [];
  if (data) return ["--data-only"];
  if (schema) return ["--schema-only"];
  throw new Error("Selected neither data nor schema to move.");
}

/**
 * The environment a client tool runs with: `environment` with every
 * inherited `PG*` variable removed, so nothing is implied from the shell,
 * and the connection laid over it as libpq's own variables.
 */
export function postgresProcessEnvironment(
  { database, host, password, port, username }: PostgresUriConnection,
  environment: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const inherited = Object.fromEntries(
    Object.entries(environment).filter(
      ([key]) => !key.startsWith(POSTGRES_ENVIRONMENT_PREFIX),
    ),
  );

  return {
    ...inherited,
    PGDATABASE: database,
    PGHOST: host,
    PGPORT: String(port),
    PGUSER: username,
    ...(password === "" ? {} : { PGPASSWORD: password }),
  };
}

/**
 * Resolves an unqualified table name in `schema`; a schema-qualified name
 * (`schema.table`) is used as written.
 */
export function qualifyTableName(table: string, schema: string): string {
  return table.includes(".") ? table : `${schema}.${table}`;
}

/** Why `url` cannot name a database to connect to, or `undefined` when it can. */
function postgresUriProblem(url: URL): string | undefined {
  if (!POSTGRES_URI_PROTOCOLS.includes(url.protocol)) {
    return "must start with postgresql:// or postgres://";
  }
  if (url.hostname === "") return "must name a host";
  if (url.username === "") return "must name a user";
  if (url.pathname.length <= 1) return "must name a database";
  if (url.search !== "") return "must not carry query parameters";
  return undefined;
}
