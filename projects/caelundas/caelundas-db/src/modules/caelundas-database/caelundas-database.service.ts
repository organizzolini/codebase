import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { READ_MODEL_STATEMENTS } from "./caelundas-database.constants";

import type { EntityManager } from "typeorm";

/**
 * Reports on the Postgres connection every caelundas application shares, and
 * keeps the derived tag tables in step with the rows a run wrote. The rows
 * themselves are read and written through the entities.
 */
@Injectable()
export class CaelundasDatabaseService {
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
   * Rebuilds the derived tag tables through `manager`, so a reader never sees them half rebuilt. The derived-times view needs no refresh.
   */
  async refreshReadModel(manager: EntityManager): Promise<void> {
    await manager.transaction(async (transaction) => {
      for (const statement of READ_MODEL_STATEMENTS) {
        await transaction.query<unknown>(statement);
      }
    });
  }
}
