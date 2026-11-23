import { Injectable } from "@nestjs/common";

import { readPostgresqlErdModel } from "./postgresql-erd.utilities";

import type { PostgresqlErdModel } from "./postgresql-erd.types";

/** Provides ERD model reading to persistence consumers. */
@Injectable()
export class PostgresqlErdService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads TypeORM entity metadata from each matching file. */
  async readModel(fileGlobs: string[]): Promise<PostgresqlErdModel> {
    return readPostgresqlErdModel(fileGlobs);
  }
}
