import { execFile } from "node:child_process";

import { Injectable } from "@nestjs/common";

import {
  POSTGRES_CLIENT_MAJOR_VERSION,
  POSTGRES_CLIENT_MAXIMUM_BUFFER_BYTES,
  PostgresClientError,
  PostgresClientToolError,
} from "./postgres-client.constants";
import {
  maskPostgresCredentials,
  parsePostgresMajorVersion,
  postgresContentFlags,
  postgresProcessEnvironment,
} from "./postgres-client.utilities";

import type {
  PostgresClientOutput,
  PostgresClientTool,
  PostgresDumpOptions,
  PostgresUriConnection,
} from "./postgres-client.types";

/**
 * Runs the PostgreSQL client tools against a connection parsed from a URI.
 * Credentials reach a tool only through its `PG*` environment, never its
 * arguments, and a tool's failure surfaces as a `PostgresClientError`
 * carrying its own error text with credentials masked.
 */
@Injectable()
export class PostgresClientService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs `tool` with `args`, connected to `connection` through its
   * environment, and resolves what it printed once it exits zero.
   *
   * @throws PostgresClientError when it exits non-zero or cannot start.
   */
  private async run(
    tool: PostgresClientTool,
    args: readonly string[],
    connection: PostgresUriConnection,
  ): Promise<PostgresClientOutput> {
    return new Promise((resolve, reject) => {
      execFile(
        tool,
        args,
        {
          env: postgresProcessEnvironment(connection),
          maxBuffer: POSTGRES_CLIENT_MAXIMUM_BUFFER_BYTES,
        },
        (error, stdout, stderr) => {
          if (error === null) {
            resolve({ stderr, stdout });
            return;
          }

          const detail = stderr.trim() === "" ? error.message : stderr.trim();
          reject(
            new PostgresClientError({
              code: error.code,
              detail: maskPostgresCredentials(detail, connection.password),
              tool,
            }),
          );
        },
      );
    });
  }

  // 🌎 Public Methods

  /**
   * Dumps exactly `tables` from `connection` to a custom-format `file`.
   * `--strict-names` makes a table that does not exist an error rather than
   * a smaller dump.
   *
   * @throws PostgresClientError when pg_dump fails.
   */
  async dump({
    connection,
    content,
    file,
    tables,
  }: PostgresDumpOptions): Promise<void> {
    await this.run(
      "pg_dump",
      [
        "--format=custom",
        `--file=${file}`,
        "--no-password",
        "--strict-names",
        ...postgresContentFlags(content),
        ...tables.map((table) => `--table=${table}`),
      ],
      connection,
    );
  }

  /**
   * Checks that `tool` is installed and major version 18, by running
   * `tool --version`. Run it before any database work: it opens no
   * connection and gives the tool no credentials.
   *
   * @throws PostgresClientToolError when the binary is missing, cannot
   * report a version, reports one that is not understood, or is not 18;
   * the message names the setup script that installs it.
   */
  async ensureTool(tool: PostgresClientTool): Promise<void> {
    const { error, stderr, stdout } = await new Promise<{
      error: Error | null;
      stderr: string;
      stdout: string;
    }>((resolve) => {
      execFile(
        tool,
        ["--version"],
        { maxBuffer: POSTGRES_CLIENT_MAXIMUM_BUFFER_BYTES },
        (failure, out, error_) => {
          resolve({ error: failure, stderr: error_, stdout: out });
        },
      );
    });

    if (error !== null) {
      throw new PostgresClientToolError(
        tool,
        "code" in error && error.code === "ENOENT"
          ? "was not found on your PATH"
          : `could not report its version: ${stderr.trim() === "" ? error.message : stderr.trim()}`,
      );
    }

    const major = parsePostgresMajorVersion(stdout);
    if (major === undefined) {
      throw new PostgresClientToolError(
        tool,
        `reported an unrecognized version: ${JSON.stringify(stdout.trim())}`,
      );
    }
    if (major !== POSTGRES_CLIENT_MAJOR_VERSION) {
      throw new PostgresClientToolError(
        tool,
        `is major version ${String(major)}, but ${String(POSTGRES_CLIENT_MAJOR_VERSION)} is required`,
      );
    }
  }
}
