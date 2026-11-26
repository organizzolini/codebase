import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { METRICS_REFRESH_STATEMENT } from "./database.constants";

import type { EntityManager } from "typeorm";

/**
 * Reports on the Postgres connection every caelundas application shares, and
 * keeps the metrics view in step with the rows a run wrote. The rows
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
   * Refreshes the metrics view through `manager`, concurrently so readers never wait; in the caller's transaction when it has one.
   */
  async refreshMetrics(manager: EntityManager): Promise<void> {
    await manager.query<unknown>(METRICS_REFRESH_STATEMENT);
  }
}
