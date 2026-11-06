import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

/**
 * Reports on the SQLite connection every caelundas application shares. The
 * rows themselves are read and written through the entities.
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
}
