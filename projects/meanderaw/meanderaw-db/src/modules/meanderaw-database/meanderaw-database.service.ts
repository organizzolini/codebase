import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  MEANDER_INSERT_CHUNK_SIZE,
  MEANDER_READ_BATCH_SIZE,
} from "./meanderaw-database.constants";
import { Meander } from "./entities/meander.entity";

import type {
  MeanderPatternShapeCount,
  MeanderRecord,
  MeanderShape,
} from "./meanderaw-database.types";
import type { ColumnMetadata } from "typeorm/metadata/ColumnMetadata.js";

/**
 * Persists meanders to the Postgres database `MEANDERAW_POSTGRES_DATABASE` names.
 * Holds no decoding or rendering logic of its own — every field it writes
 * arrives already computed, so this is the one seam between the generic
 * rendering pipeline and TypeORM.
 */
@Injectable()
export class MeanderawDatabaseService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Meander)
    private readonly meanderRepository: Repository<Meander>,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * One record's value for one column, as the database stores it. An omitted
   * column takes its default.
   */
  private persistentValue(
    record: MeanderRecord,
    column: ColumnMetadata,
  ): unknown {
    const value: unknown = column.getEntityValue(record);

    if (value === undefined) {
      return column.default;
    }

    return this.meanderRepository.manager.dataSource.driver.preparePersistentValue(
      value,
      column,
    );
  }

  // 🌎 Public Methods

  /**
   * Deletes every meander row in one `TRUNCATE`, so a draw run regenerates the
   * table rather than colliding with rows it already holds.
   */
  async clear(): Promise<void> {
    await this.meanderRepository.clear();
  }

  /**
   * Every Code the rows of one shape hold, so the draw run can skip them.
   */
  async codes(shape: MeanderShape): Promise<Set<string>> {
    const rows = await this.meanderRepository.find({
      select: { code: true },
      where: { columns: shape.columns, rows: shape.rows },
    });

    return new Set(rows.map(({ code }) => code));
  }

  /**
   * Finds one meander by its formatted Code, which is its identity: the
   * Code already spells out its columns, rows, lattice, and repeats.
   */
  async findOneByCode(code: string): Promise<Meander | null> {
    return this.meanderRepository.findOneBy({ code });
  }

  /**
   * The rows one pattern characteristic holds for, `batchSize` at a time, in
   * page order. Each batch resumes after the last.
   */
  async *patternRows(
    key: string,
    batchSize = MEANDER_READ_BATCH_SIZE,
  ): AsyncGenerator<Meander[]> {
    let after: Meander | undefined;

    do {
      const query = this.meanderRepository
        .createQueryBuilder("meander")
        .where("meander.characteristics ? :key", { key })
        .orderBy("meander.rows")
        .addOrderBy("meander.columns")
        .addOrderBy("meander.code")
        .limit(batchSize);

      if (after !== undefined) {
        query.andWhere(
          "(meander.rows, meander.columns, meander.code) > (:rows, :columns, :code)",
          {
            code: after.code,
            columns: after.columns,
            rows: after.rows,
          },
        );
      }

      const batch = await query.getMany();

      after = batch.at(-1);

      if (after !== undefined) {
        yield batch;
      }
    } while (after !== undefined);
  }

  /**
   * Counts the rows each of `keys` holds per shape, in one pass. Raw SQL, since
   * a set-returning function must be joined laterally.
   */
  async patternShapeCounts(
    keys: readonly string[],
  ): Promise<MeanderPatternShapeCount[]> {
    const { tablePath } = this.meanderRepository.metadata;
    const counted: {
      columns: string;
      count: string;
      key: string;
      rows: string;
    }[] = await this.meanderRepository.query(
      `SELECT pattern AS key, meander.rows, meander.columns, COUNT(*) AS count
       FROM ${tablePath} meander
       CROSS JOIN LATERAL jsonb_object_keys(meander.characteristics) AS pattern
       WHERE pattern = ANY($1)
       GROUP BY pattern, meander.rows, meander.columns`,
      [keys],
    );

    // A raw row skips the entity's column transformers, and `pg` returns a
    // `bigint` as a string, so each number is converted here.
    return counted.map(({ columns, count, key, rows }) => ({
      columns: Number(columns),
      count: Number(count),
      key,
      rows: Number(rows),
    }));
  }

  /**
   * Writes one meander row. A Code already held is refused by the unique index
   * over `code`.
   */
  async save(record: MeanderRecord): Promise<Meander> {
    return this.meanderRepository.save(record);
  }

  /**
   * Writes many meander rows in one transaction, chunked, as one prepared
   * multi-row `INSERT` each. A duplicate Code rejects the whole chunk.
   */
  async saveAll(records: readonly MeanderRecord[]): Promise<number> {
    const { columns, tablePath } = this.meanderRepository.metadata;
    // A generated column, or one whose default is a SQL expression such as
    // `id`'s `uuidv7()`, is the database's to fill rather than the row's.
    const written = columns.filter(
      (column) => !column.isGenerated && typeof column.default !== "function",
    );
    const table = tablePath
      .split(".")
      .map((part) => `"${part}"`)
      .join(".");
    const names = written.map(({ databaseName }) => `"${databaseName}"`);

    await this.meanderRepository.manager.transaction(async (manager) => {
      for (
        let start = 0;
        start < records.length;
        start += MEANDER_INSERT_CHUNK_SIZE
      ) {
        const chunk = records.slice(start, start + MEANDER_INSERT_CHUNK_SIZE);
        const parameters = chunk.flatMap((record) =>
          written.map((column) => this.persistentValue(record, column)),
        );
        const rows = chunk.map(
          (_record, row) =>
            `(${written.map((_column, column) => `$${row * written.length + column + 1}`).join(", ")})`,
        );

        await manager.query(
          `INSERT INTO ${table} (${names.join(", ")}) VALUES ${rows.join(", ")}`,
          parameters,
        );
      }
    });

    return records.length;
  }
}
