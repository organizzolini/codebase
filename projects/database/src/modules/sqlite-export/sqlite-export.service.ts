import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { maskPostgresCredentials } from "../postgres-client/postgres-client.utilities";

import {
  SqliteExportError,
  SqliteExportTablesError,
} from "./sqlite-export.constants";
import {
  createSqliteFile,
  missingPostgresTables,
} from "./sqlite-export.utilities";

import type { SqliteExportOptions } from "./sqlite-export.types";

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

  // 🌎 Public Methods

  /**
   * Writes `tables` from `connection` to a new SQLite `file`.
   *
   * @throws SqliteExportTablesError naming every table the source lacks,
   * or SqliteExportError when the source cannot be read.
   */
  async export({
    connection,
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
      const missing = await missingPostgresTables(
        async (sql, parameters = []) =>
          dataSource.query<unknown[]>(sql, [...parameters]),
        tables,
      );
      if (missing.length > 0) throw new SqliteExportTablesError(missing);
      createSqliteFile(file);
    } catch (error) {
      if (error instanceof SqliteExportTablesError) throw error;
      const detail = error instanceof Error ? error.message : String(error);
      throw new SqliteExportError(maskPostgresCredentials(detail, password));
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }
}
