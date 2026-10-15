import { DEFAULT_POSTGRES_PORT } from "../database/database.constants";

import {
  MASKED_PASSWORD,
  POSTGRES_ENVIRONMENT_PREFIX,
  POSTGRES_URI_PASSWORD_PATTERN,
  POSTGRES_URI_PROTOCOLS,
  POSTGRES_VERSION_PATTERN,
  PostgresTableNameError,
  PostgresUriError,
} from "./postgres-client.constants";

import type {
  PostgresContent,
  PostgresUriConnection,
} from "./postgres-client.types";

// 🌎 Utilities

/** Names `content` for a log line: `data`, `schema`, or `data and schema`. */
export function describePostgresContent({
  data,
  schema,
}: PostgresContent): string {
  if (data && schema) return "data and schema";
  return data ? "data" : "schema";
}

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
 * The major version a client tool's `--version` output reports, such as 18
 * for `pg_dump (PostgreSQL) 18.6` or `18beta1`; `undefined` when the output
 * is not in that shape.
 */
export function parsePostgresMajorVersion(output: string): number | undefined {
  const major = POSTGRES_VERSION_PATTERN.exec(output)?.[1];
  return major === undefined ? undefined : Number(major);
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
 * and the connection, when there is one, laid over it as libpq's own
 * variables.
 */
export function postgresProcessEnvironment(
  connection: PostgresUriConnection | undefined,
  environment: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const inherited = Object.fromEntries(
    Object.entries(environment).filter(
      ([key]) => !key.startsWith(POSTGRES_ENVIRONMENT_PREFIX),
    ),
  );
  if (connection === undefined) return inherited;

  const { database, host, password, port, username } = connection;
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
 * Schema-qualifies `tables`, in order: a `schema.table` name is used as
 * written, and an unqualified one resolves in `namespace`. There is no
 * default schema, so without a namespace every name must be qualified.
 *
 * @throws PostgresTableNameError naming every unqualified table when
 * `namespace` is missing or empty.
 */
export function qualifyTableNames(
  tables: readonly string[],
  namespace: string | undefined,
): string[] {
  const unqualified = tables.filter((table) => !table.includes("."));
  if (unqualified.length > 0 && (namespace ?? "") === "") {
    throw new PostgresTableNameError(unqualified);
  }
  return tables.map((table) =>
    table.includes(".") ? table : `${namespace ?? ""}.${table}`,
  );
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
