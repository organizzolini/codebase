import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Constellation, Star } from "@codebase/caelundas-db";
import { LoggerService } from "@codebase/observability";

import { POSTGRES_MAXIMUM_PARAMETERS } from "../../caelundas-cli.constants";

import { CONSTELLATION_SAVE_CHUNK_SIZE } from "./night-sky.constants";
import { buildNightSkyRows } from "./night-sky.utilities";

import type { NightSkyFiles, NightSkyRows } from "./night-sky.types";
import type { EntityManager, EntityTarget, ObjectLiteral } from "typeorm";

/**
 * Rewrites the night sky's tables, `stars`, `constellations` and the edges of
 * their figures, from the downloaded HYG catalog and d3-celestial's
 * constellations and figures, in one transaction, so a reader never sees a
 * half-written sky. A constellation is saved with its `edges`, which its
 * generated edge entity stores.
 */
@Injectable()
export class NightSkyService {
  // 🏗 Dependency Injection

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(NightSkyService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Inserts rows in batches under Postgres's parameter limit; a wide row,
   * binding more parameters, makes a smaller batch.
   */
  private async insertInBatches<Entity extends ObjectLiteral>(
    manager: EntityManager,
    target: EntityTarget<Entity>,
    rows: readonly Entity[],
  ): Promise<void> {
    const [first] = rows;

    if (first === undefined) {
      return;
    }

    const batchSize = Math.floor(
      POSTGRES_MAXIMUM_PARAMETERS / Object.keys(first).length,
    );

    for (let start = 0; start < rows.length; start += batchSize) {
      await manager.insert(target, rows.slice(start, start + batchSize));
    }
  }

  /**
   * Empties the constellations, whose edges go with them, and the stars, then
   * writes the stars and each constellation with its edges, which refer to
   * the stars.
   */
  private async replace(
    manager: EntityManager,
    rows: NightSkyRows,
  ): Promise<void> {
    for (const target of [Constellation, Star]) {
      await manager.createQueryBuilder().delete().from(target).execute();
    }
    await this.insertInBatches(manager, Star, rows.stars);
    await manager.save(Constellation, rows.constellations, {
      chunk: CONSTELLATION_SAVE_CHUNK_SIZE,
    });
  }

  // 🌎 Public Methods

  /**
   * Reads the three files, builds the rows and replaces the tables' rows
   * with them, returning what was written.
   */
  async ingest(files: NightSkyFiles): Promise<NightSkyRows> {
    const [constellations, lines, stars] = await Promise.all([
      readFile(files.constellations, "utf8"),
      readFile(files.lines, "utf8"),
      readFile(files.stars, "utf8"),
    ]);
    const rows = buildNightSkyRows({ constellations, lines, stars });

    await this.dataSource.transaction(async (manager) =>
      this.replace(manager, rows),
    );
    this.logger.info("🌌 Ingested the night sky", undefined, {
      constellations: rows.constellations.length,
      edges: rows.constellations.reduce(
        (total, { edges }) => total + edges.length,
        0,
      ),
      stars: rows.stars.length,
    });

    return rows;
  }
}
