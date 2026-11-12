import { DEFAULT_POSTGRES_PORT } from "../postgresql/postgresql.constants";

import {
  MASKED_PASSWORD,
  POSTGRES_ENVIRONMENT_PREFIX,
  POSTGRES_URI_PASSWORD_PATTERN,
  POSTGRES_URI_PROTOCOLS,
  POSTGRES_VERSION_PATTERN,
  PostgresTableNameError,
  PostgresUriError,
} from "./postgresql-utilities.constants";

import type {
  PostgresContent,
  PostgresUriConnection,
} from "./postgresql-utilities.types";

// 🌎 Utilities

/** Names `content` for a log line: `data`, `DDL`, or `data and DDL`. */
export function describePostgresContent({
  data,
  ddl,
}: PostgresContent): string {
  if (data && ddl) return "data and DDL";
  return data ? "data" : "DDL";
}

/**
 * Masks every URI password, and `password` wherever else it appears, with
 * `****`. Everything logged passes through here.
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
 * for `18beta1`; `undefined` for unrecognized output.
 */
export function parsePostgresMajorVersion(output: string): number | undefined {
  const major = POSTGRES_VERSION_PATTERN.exec(output)?.[1];
  return major === undefined ? undefined : Number(major);
}

/**
 * Parses a `postgresql://` URI, which needs a user, host, and database; the
 * password is optional.
 * @throws PostgresUriError naming `option`, never the URI.
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
 * The pg_dump or pg_restore flag for `content`: none when both are wanted, as
 * both tools refuse the pair. Throws when neither is selected.
 */
export function postgresContentFlags({ data, ddl }: PostgresContent): string[] {
  if (data && ddl) return [];
  if (data) return ["--data-only"];
  if (ddl) return ["--schema-only"];
  throw new Error("Selected neither data nor DDL to move.");
}

/**
 * The environment a client tool runs with: inherited `PG*` variables removed,
 * so nothing comes from the shell, and the connection laid over it.
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
 * Schema-qualifies `tables`, resolving unqualified names in `schema`.
 * @throws PostgresTableNameError naming every unqualified table when `schema` is empty.
 */
export function qualifyTableNames(
  tables: readonly string[],
  schema: string | undefined,
): string[] {
  const unqualified = tables.filter((table) => !table.includes("."));
  if (unqualified.length > 0 && (schema ?? "") === "") {
    throw new PostgresTableNameError(unqualified);
  }
  return tables.map((table) =>
    table.includes(".") ? table : `${schema ?? ""}.${table}`,
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
