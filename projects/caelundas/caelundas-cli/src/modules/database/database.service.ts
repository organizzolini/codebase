import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { DATABASE_READ_MODEL_FILE } from "./database.constants";

import type { EntityManager } from "typeorm";

/**
 * Reports on the SQLite connection every caelundas repository shares, and
 * keeps the read model caelundas-web queries in step with what a run wrote.
 * The calendar events themselves are read and written by
 * `CalendarEventsService`.
 */
@Injectable()
export class DatabaseService {
  // 🏗 Dependency Injection

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Whether the connection to the database is currently open. */
  isConnected(): boolean {
    return this.dataSource.isInitialized;
  }

  /**
   * Rewrites the read-model tables from the tables a run wrote, through
   * `manager` so it belongs to the caller's transaction: it runs each
   * statement of `events-read-model.sql`, which the driver takes one at a
   * time.
   */
  async refreshReadModel(manager: EntityManager): Promise<void> {
    const sql = await readFile(DATABASE_READ_MODEL_FILE, "utf8");

    for (const statement of sql.split(/;\s*\n/u)) {
      if (statement.trim() !== "") {
        await manager.query<unknown>(statement);
      }
    }
  }
}
