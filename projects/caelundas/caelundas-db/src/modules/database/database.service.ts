import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { METRICS_REFRESH_STATEMENTS } from "./modules/metrics/calendar-event-facts.constants";

import type { EntityManager } from "typeorm";

/**
 * Reports on the Postgres connection every caelundas application shares, and
 * keeps the metrics facts in step with the rows a run wrote. The rows
 * themselves are read and written through the entities.
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
   * Refreshes the tag sets and rebuilds the facts through `manager`, without locking readers out; in the caller's transaction when it has one.
   */
  async refreshMetrics(manager: EntityManager): Promise<void> {
    for (const statement of METRICS_REFRESH_STATEMENTS) {
      await manager.query<unknown>(statement);
    }
  }
}
