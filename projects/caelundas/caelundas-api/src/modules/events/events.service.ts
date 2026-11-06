import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import type { z } from "zod";

/**
 * Reads the calendar's events, tag facets and dataset span. Every read is a
 * SQL statement against the Caelundas Postgres, whose rows are validated
 * before they leave the service.
 */
@Injectable()
export class EventsService {
  // 🏗 Dependency Injection

  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Runs one statement with its `$n` parameters on the shared connection and
   * parses every row with `schema`, so a column the database returns in an
   * unexpected shape fails here rather than reaching a client.
   */
  public async select<Row>(
    sql: string,
    parameters: readonly unknown[],
    schema: z.ZodType<Row>,
  ): Promise<Row[]> {
    const rows = await this.manager.query<unknown[]>(sql, [...parameters]);

    return rows.map((row) => schema.parse(row));
  }
}
