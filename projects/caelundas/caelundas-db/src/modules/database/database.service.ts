import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import {
  METRICS_REFRESH_STATEMENTS,
  READ_MODEL_STATEMENTS,
} from "./database.constants";

import type { EntityManager } from "typeorm";

/**
 * Reports on the Postgres connection every caelundas application shares, and
 * keeps the derived tag tables and metrics views in step with the rows a run wrote. The rows
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
   * Refreshes the metrics materialized views through `manager`, concurrently so readers never wait. `refreshReadModel` runs it last; call it alone to refresh with no rebuild.
   */
  async refreshMetrics(manager: EntityManager): Promise<void> {
    await manager.transaction(async (transaction) => {
      for (const statement of METRICS_REFRESH_STATEMENTS) {
        await transaction.query<unknown>(statement);
      }
    });
  }

  /**
   * Rebuilds the derived tag tables through `manager`, then refreshes the metrics views, so a reader never sees them half rebuilt.
   */
  async refreshReadModel(manager: EntityManager): Promise<void> {
    await manager.transaction(async (transaction) => {
      for (const statement of [
        ...READ_MODEL_STATEMENTS,
        ...METRICS_REFRESH_STATEMENTS,
      ]) {
        await transaction.query<unknown>(statement);
      }
    });
  }
}
