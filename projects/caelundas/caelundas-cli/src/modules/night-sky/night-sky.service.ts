import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import {
  Constellation,
  ConstellationLine,
  Star,
} from "@codebase/caelundas-entities";
import { LoggerService } from "@codebase/observability";

import { INSERT_BATCH_SIZE } from "./night-sky.constants";
import { buildNightSkyRows } from "./night-sky.utilities";

import type { NightSkyFiles, NightSkyRows } from "./night-sky.types";
import type { EntityManager, EntityTarget, ObjectLiteral } from "typeorm";

/**
 * Rewrites the night sky's tables, `star`, `constellation` and
 * `constellation_line`, from the downloaded HYG catalog and d3-celestial's
 * constellations and figures, in one transaction, so a reader never sees a
 * half-written sky.
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
   * Inserts rows of one entity in batches under SQLite's parameter limit.
   */
  private async insertInBatches<Entity extends ObjectLiteral>(
    manager: EntityManager,
    target: EntityTarget<Entity>,
    rows: readonly Entity[],
  ): Promise<void> {
    for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
      await manager.insert(
        target,
        rows.slice(start, start + INSERT_BATCH_SIZE),
      );
    }
  }

  /**
   * Empties the three tables and writes the new rows, segments last, since
   * each refers to its constellation and its two stars.
   */
  private async replace(
    manager: EntityManager,
    rows: NightSkyRows,
  ): Promise<void> {
    await manager.query<unknown>(`delete from "constellation_line"`);
    await manager.query<unknown>(`delete from "constellation"`);
    await manager.query<unknown>(`delete from "star"`);
    await this.insertInBatches(manager, Star, rows.stars);
    await this.insertInBatches(manager, Constellation, rows.constellations);
    await this.insertInBatches(manager, ConstellationLine, rows.lines);
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
      lines: rows.lines.length,
      stars: rows.stars.length,
    });

    return rows;
  }
}
