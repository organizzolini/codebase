import { DatabaseSync } from "node:sqlite";

import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { z } from "zod";

import { maskPostgresCredentials } from "../postgres-client/postgres-client.utilities";

import {
  SqliteExportColumnError,
  SqliteExportError,
  SqliteExportNameError,
  SqliteExportTablesError,
} from "./sqlite-export.constants";
import {
  createSqliteTableSql,
  insertSqliteRows,
  missingPostgresTables,
  postgresColumns,
  readPostgresRows,
  sqliteTables,
} from "./sqlite-export.utilities";

import type { PostgresQuery } from "../postgres-client/postgres-client.types";
import type {
  SqliteExportOptions,
  SqliteTable,
  SqliteWrite,
} from "./sqlite-export.types";

/**
 * Writes selected Postgres tables to a SQLite file. Rows come through the
 * `pg` driver and go out through `node:sqlite`, so the export needs no
 * Postgres client tools and no native SQLite dependency. It names no table
 * of its own: any table in any schema can be exported.
 */
@Injectable()
export class SqliteExportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Resolves each of `tables` with its columns and SQLite types, before
   * anything is written.
   *
   * @throws SqliteExportTablesError naming every table the source lacks,
   * SqliteExportColumnError naming a column whose type has no mapping, or
   * SqliteExportNameError when two tables would share a SQLite name.
   */
  private async describe(
    query: PostgresQuery,
    tables: readonly string[],
  ): Promise<SqliteTable[]> {
    const missing = await missingPostgresTables(query, tables);
    if (missing.length > 0) throw new SqliteExportTablesError(missing);
    return sqliteTables(tables, await postgresColumns(query, tables));
  }

  /**
   * Writes `tables` to a new SQLite `file` in one transaction: each
   * table's definition, then, with `data`, its rows. A failure closes the
   * file uncommitted, so it holds nothing.
   */
  private async write(
    query: PostgresQuery,
    { data, file, tables }: SqliteWrite,
  ): Promise<void> {
    const database = new DatabaseSync(file);
    try {
      database.exec("BEGIN");
      for (const table of tables) {
        database.exec(createSqliteTableSql(table));
        if (!data) continue;
        for await (const rows of readPostgresRows(query, table)) {
          insertSqliteRows(database, table, rows);
        }
      }
      database.exec("COMMIT");
    } finally {
      database.close();
    }
  }

  // 🌎 Public Methods

  /**
   * Writes `tables` from `connection` to a new SQLite `file`. A table's
   * definition is always written, since a SQLite file cannot hold rows
   * without it; `content.data` adds the rows.
   *
   * @throws SqliteExportTablesError naming every table the source lacks,
   * SqliteExportColumnError naming a column whose type has no SQLite
   * mapping, SqliteExportNameError when two tables would share a SQLite
   * name, or SqliteExportError when the source cannot be read.
   */
  async export({
    connection,
    content,
    file,
    tables,
  }: SqliteExportOptions): Promise<void> {
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
      // One connection, since a cursor lives inside one transaction.
      const runner = dataSource.createQueryRunner();
      const query: PostgresQuery = async (sql, parameters = []) => {
        return z
          .array(z.unknown())
          .parse(await runner.query(sql, [...parameters]));
      };
      try {
        await this.write(query, {
          data: content.data,
          file,
          tables: await this.describe(query, tables),
        });
      } finally {
        await runner.release();
      }
    } catch (error) {
      if (
        error instanceof SqliteExportTablesError ||
        error instanceof SqliteExportColumnError ||
        error instanceof SqliteExportNameError
      ) {
        throw error;
      }
      const detail = error instanceof Error ? error.message : String(error);
      throw new SqliteExportError(maskPostgresCredentials(detail, password));
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }
}
