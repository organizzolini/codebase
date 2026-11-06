import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { CAELUNDAS_READ_MODEL_STATEMENTS } from "./database.constants";

import type { EntityManager } from "typeorm";

/**
 * Reports on the SQLite connection every caelundas application shares, and
 * keeps the derived tag tables in step with the rows a run wrote. The rows
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
   * Rebuilds the derived tag tables, `tag_nodes` and
   * `calendar_event_tag_nodes`, from the tags, their closure and the events'
   * tags, through `manager` in one transaction: a reader never sees them
   * half rebuilt. A manager that is already inside a transaction nests this
   * one in it, so the caller's transaction decides when it commits.
   * The derived-times view needs no refresh, since SQLite reads it from the
   * events on every query.
   */
  async refreshReadModel(manager: EntityManager): Promise<void> {
    await manager.transaction(async (transaction) => {
      for (const statement of CAELUNDAS_READ_MODEL_STATEMENTS) {
        await transaction.query<unknown>(statement);
      }
    });
  }
}
