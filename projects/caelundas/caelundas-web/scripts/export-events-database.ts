import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { connect } from "node:net";
import path from "node:path";

// Exports the tables `caelundas-cli` ingests into from Postgres to a raw
// SQLite file, through `persistence export --sqlite`. The connection is read
// from the same `CAELUNDAS_POSTGRES_*` variables ingestion reads, so both
// reach one database: the shell's values win, then `caelundas-cli/.env`,
// then the local Docker defaults its `.env.default` documents.

const projectRoot = path.resolve(import.meta.dirname, "..");
const ingestionEnvironmentPath = path.join(
  projectRoot,
  "..",
  "caelundas-cli",
  ".env",
);
// The `persistence` project's `start` target runs its command line from here.
const persistenceProjectRoot = path.join(
  projectRoot,
  "..",
  "..",
  "persistence",
);

/** The highest TCP port. */
const MAXIMUM_PORT = 65_535;

/** The tables the app reads, in the schema ingestion writes to. */
const TABLES = [
  "calendar_events",
  "tags",
  "tags_closure",
  "calendar_event_tags",
];

/** How long to wait for Postgres to accept a connection. */
const CONNECT_TIMEOUT_MILLISECONDS = 5000;

/** Where and as whom ingestion connects to Postgres. */
interface PostgresConnection {
  database: string;
  host: string;
  password: string;
  port: number;
  schema: string;
  username: string;
}

/**
 * Exports the ingested tables to a new SQLite `file`. The export writes
 * beside it and replaces any file already there only once it succeeds.
 *
 * The `persistence` command line runs directly rather than through `nx run`,
 * so its arguments are passed as a list no shell reads, and the password in
 * the source URI is never echoed: the command masks it in what it logs.
 *
 * @throws Error naming the address when the port is not one or nothing
 * answers there, since the export itself reports a refused connection with
 * an empty message, or when the export fails.
 */
export async function exportEventsDatabase(file: string): Promise<void> {
  const connection = readConnection();
  const address = `${connection.host}:${String(connection.port)}`;

  if (
    !Number.isInteger(connection.port) ||
    connection.port < 1 ||
    connection.port > MAXIMUM_PORT ||
    !(await isReachable(connection))
  ) {
    throw new Error(
      [
        `Cannot reach Postgres at ${address}, so there is nothing to export.`,
        "Start the local Postgres container, or point CAELUNDAS_POSTGRES_HOST and",
        "CAELUNDAS_POSTGRES_PORT at the database caelundas-cli ingested into.",
      ].join("\n"),
    );
  }

  mkdirSync(path.dirname(file), { recursive: true });

  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "src/persistence.main.ts",
      "export",
      ...toExportArguments(connection, file),
    ],
    { cwd: persistenceProjectRoot, stdio: "inherit" },
  );

  if (result.status !== 0) {
    throw new Error(`The export from Postgres at ${address} failed`);
  }
}

/** Whether something accepts a TCP connection at the connection's address. */
async function isReachable({
  host,
  port,
}: PostgresConnection): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const settle = (reachable: boolean): void => {
      socket.destroy();
      resolve(reachable);
    };

    socket.setTimeout(CONNECT_TIMEOUT_MILLISECONDS, () => {
      settle(false);
    });
    socket.once("connect", () => {
      settle(true);
    });
    socket.once("error", () => {
      settle(false);
    });
  });
}

/** The connection ingestion uses, from the environment and its `.env`. */
function readConnection(): PostgresConnection {
  if (existsSync(ingestionEnvironmentPath)) {
    process.loadEnvFile(ingestionEnvironmentPath);
  }

  const environment = process.env;

  return {
    database:
      environment["CAELUNDAS_POSTGRES_DATABASE"] ?? "caelundas_development",
    host: environment["CAELUNDAS_POSTGRES_HOST"] ?? "localhost",
    password:
      environment["CAELUNDAS_POSTGRES_PASSWORD"] ?? "caelundas_password",
    port: Number(environment["CAELUNDAS_POSTGRES_PORT"] ?? "5432"),
    schema: environment["CAELUNDAS_POSTGRES_SCHEMA"] ?? "caelundas",
    username:
      environment["CAELUNDAS_POSTGRES_USERNAME"] ?? "caelundas_username",
  };
}

/** The `persistence export` arguments that write the tables to `file`. */
function toExportArguments(
  connection: PostgresConnection,
  file: string,
): string[] {
  const credentials = `${encodeURIComponent(connection.username)}:${encodeURIComponent(connection.password)}`;
  const sourceUri = `postgresql://${credentials}@${connection.host}:${String(connection.port)}/${connection.database}`;

  return [
    "--sqlite",
    "--source-uri",
    sourceUri,
    "--schema",
    connection.schema,
    ...TABLES.flatMap((table) => ["--table", table]),
    "--data",
    "--ddl",
    "--file",
    file,
    "--overwrite",
  ];
}
