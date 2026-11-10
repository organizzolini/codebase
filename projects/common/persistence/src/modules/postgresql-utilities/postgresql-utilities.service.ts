import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import {
  parsePostgresDumpContents,
  selectPostgresDumpEntries,
} from "./postgresql-dump.utilities";
import { truncatePostgresTables } from "./postgresql-truncate.utilities";
import {
  POSTGRES_CLIENT_MAJOR_VERSION,
  POSTGRES_CLIENT_MAXIMUM_BUFFER_BYTES,
  PostgresClientError,
  PostgresClientToolError,
  PostgresReferencedTablesError,
  PostgresTruncateError,
} from "./postgresql-utilities.constants";
import {
  maskPostgresCredentials,
  parsePostgresMajorVersion,
  postgresContentFlags,
  postgresProcessEnvironment,
} from "./postgresql-utilities.utilities";

import type {
  PostgresClientOutput,
  PostgresClientTool,
  PostgresDumpEntry,
  PostgresDumpOptions,
  PostgresRestoreOptions,
  PostgresTruncateOptions,
  PostgresUriConnection,
} from "./postgresql-utilities.types";

/**
 * Runs the PostgreSQL client tools against a connection parsed from a URI.
 * Credentials reach a tool only through its `PG*` environment, never its
 * arguments, and a tool's failure surfaces as a `PostgresClientError`
 * carrying its own error text with credentials masked.
 */
@Injectable()
export class PostgresqlUtilitiesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs `tool` with its connection in the environment, resolving its output
   * once it exits zero.
   * @throws PostgresClientError on failure.
   */
  private async run(
    tool: PostgresClientTool,
    args: readonly string[],
    connection?: PostgresUriConnection,
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
              detail: maskPostgresCredentials(detail, connection?.password),
              tool,
            }),
          );
        },
      );
    });
  }

  // 🌎 Public Methods

  /**
   * Dumps exactly `tables` to a custom-format `file`; `--strict-names` makes a
   * missing table an error. @throws PostgresClientError when pg_dump fails.
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
   * Checks that `tool` is installed at major version 18, before any connection.
   * @throws PostgresClientToolError when it is missing or the wrong version.
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

  /**
   * Reads the dump's table of contents with `pg_restore --list`, which connects
   * to no database. @throws PostgresClientError when it cannot read the file.
   */
  async list(file: string): Promise<PostgresDumpEntry[]> {
    const { stdout } = await this.run("pg_restore", [
      "--list",
      "--verbose",
      file,
    ]);
    return parsePostgresDumpContents(stdout);
  }

  /**
   * Restores exactly `tables` in one transaction. A `--use-list` keeps their
   * indexes and constraints, which `--table` would omit.
   * @throws PostgresClientError when pg_restore fails.
   */
  async restore({
    clean = false,
    connection,
    content,
    contents,
    file,
    tables,
  }: PostgresRestoreOptions): Promise<void> {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "database-import-"),
    );
    const list = path.join(directory, "restore.list");

    try {
      await fs.writeFile(
        list,
        selectPostgresDumpEntries(contents, tables)
          .map((id) => `${String(id)};\n`)
          .join(""),
      );
      await this.run(
        "pg_restore",
        [
          `--dbname=${connection.database}`,
          "--no-password",
          "--single-transaction",
          "--exit-on-error",
          "--no-owner",
          "--no-privileges",
          ...(clean && content.ddl ? ["--clean", "--if-exists"] : []),
          ...postgresContentFlags(content),
          `--use-list=${list}`,
          file,
        ],
        connection,
      );
    } finally {
      await fs.rm(directory, { force: true, recursive: true });
    }
  }

  /**
   * Empties tables through the `pg` driver, since `pg_restore` cannot do
   * data-only restores. Commits on its own.
   * @throws PostgresReferencedTablesError or PostgresTruncateError; nothing truncated.
   */
  async truncate({
    connection,
    tables,
  }: PostgresTruncateOptions): Promise<void> {
    const { database, host, password, port, username } = connection;
    const dataSource = new DataSource({
      applicationName: "database",
      database,
      host,
      logging: false,
      password,
      port,
      type: "postgres",
      username,
    });

    try {
      await dataSource.initialize();
      await truncatePostgresTables(
        async (sql, parameters = []) =>
          dataSource.query<unknown[]>(sql, [...parameters]),
        tables,
      );
    } catch (error) {
      if (error instanceof PostgresReferencedTablesError) throw error;
      const detail = error instanceof Error ? error.message : String(error);
      throw new PostgresTruncateError(
        maskPostgresCredentials(detail, password),
      );
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }
}
