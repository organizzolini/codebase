import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Characteristic } from "./entities/characteristic.entity";
import { MeanderCharacteristic } from "./entities/meander-characteristic.entity";
import { Meander } from "./entities/meander.entity";
import {
  CHARACTERISTIC_INSERT_CHUNK_SIZE,
  MEANDER_INSERT_CHUNK_SIZE,
  MEANDER_READ_BATCH_SIZE,
  UnknownCharacteristicError,
} from "./meanderaw-database.constants";

import type {
  CharacteristicRecord,
  MeanderHolding,
  MeanderPatternShapeCount,
  MeanderRecord,
  MeanderShape,
} from "./meanderaw-database.types";
import type { EntityManager } from "typeorm";
import type { ColumnMetadata } from "typeorm/metadata/ColumnMetadata.js";

/**
 * Persists meanders to the Postgres database `MEANDERAW_POSTGRES_DATABASE` names,
 * the one seam between the rendering pipeline and TypeORM. A meander's
 * characteristics are bridge rows, one per true boolean or number above 0,
 * keyed by the catalog; a missing row reads as 0 or false.
 */
@Injectable()
export class MeanderawDatabaseService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Meander)
    private readonly meanderRepository: Repository<Meander>,
    @InjectRepository(Characteristic)
    private readonly characteristicRepository: Repository<Characteristic>,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The booleans each of `ids` holds, by meander id. */
  private async heldBooleans(
    ids: readonly string[],
  ): Promise<Map<string, Record<string, true>>> {
    const held: { key: string; meanderId: string }[] =
      await this.meanderRepository.query(
        `SELECT bridge.meander_id AS "meanderId", catalog.key
         FROM ${this.table(MeanderCharacteristic)} bridge
         JOIN ${this.table(Characteristic)} catalog ON catalog.id = bridge.characteristic_id
         WHERE bridge.meander_id = ANY($1) AND catalog.value_type = 'boolean'`,
        [ids],
      );
    const byMeander = new Map<string, Record<string, true>>();

    for (const { key, meanderId } of held) {
      byMeander.set(meanderId, { ...byMeander.get(meanderId), [key]: true });
    }

    return byMeander;
  }

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

  /** A table's schema-qualified, quoted name, for raw SQL. */
  private table(entity: new () => object): string {
    return this.meanderRepository.manager
      .getRepository(entity)
      .metadata.tablePath.split(".")
      .map((part) => `"${part}"`)
      .join(".");
  }

  /**
   * Writes the bridge rows for meanders just inserted, found by Code, in
   * chunks of parallel arrays. Throws when a key has no catalog row.
   */
  private async writeCharacteristics(
    manager: EntityManager,
    records: readonly Pick<MeanderRecord, "characteristics" | "code">[],
  ): Promise<void> {
    const registered = await manager.getRepository(Characteristic).find({
      select: { key: true },
    });
    const known = new Set(registered.map(({ key }) => key));
    const rows = records.flatMap(({ characteristics, code }) =>
      Object.entries(characteristics).map(([key, value]) => ({
        code,
        key,
        value: value === true ? 1 : value,
      })),
    );
    const unknown = rows.find(({ key }) => !known.has(key));

    if (unknown !== undefined) {
      throw new UnknownCharacteristicError(unknown.key);
    }

    for (
      let start = 0;
      start < rows.length;
      start += CHARACTERISTIC_INSERT_CHUNK_SIZE
    ) {
      const chunk = rows.slice(start, start + CHARACTERISTIC_INSERT_CHUNK_SIZE);

      await manager.query(
        `INSERT INTO ${this.table(MeanderCharacteristic)} (meander_id, characteristic_id, value)
         SELECT meander.id, catalog.id, written.value
         FROM unnest($1::text[], $2::text[], $3::double precision[]) AS written(code, key, value)
         JOIN ${this.table(Meander)} meander ON meander.code = written.code
         JOIN ${this.table(Characteristic)} catalog ON catalog.key = written.key`,
        [
          chunk.map(({ code }) => code),
          chunk.map(({ key }) => key),
          chunk.map(({ value }) => value),
        ],
      );
    }
  }

  // 🌎 Public Methods

  /** Truncates the meanders and their bridge rows in one statement, so a draw run regenerates them. The catalog stays. */
  async clear(): Promise<void> {
    await this.meanderRepository.query(
      `TRUNCATE TABLE ${this.table(MeanderCharacteristic)}, ${this.table(Meander)}`,
    );
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

  /** The rows one pattern holds for, `batchSize` at a time in page order, each with its held booleans. */
  async *patternRows(
    key: string,
    batchSize = MEANDER_READ_BATCH_SIZE,
  ): AsyncGenerator<MeanderHolding[]> {
    let after: Meander | undefined;

    do {
      const query = this.meanderRepository
        .createQueryBuilder("meander")
        .where(
          `EXISTS (
            SELECT 1 FROM ${this.table(MeanderCharacteristic)} bridge
            WHERE bridge.meander_id = meander.id
              AND bridge.characteristic_id = (SELECT id FROM ${this.table(Characteristic)} WHERE key = :key)
          )`,
          { key },
        )
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
      const held = await this.heldBooleans(batch.map(({ id }) => id));

      after = batch.at(-1);

      if (after !== undefined) {
        yield batch.map((meander) =>
          Object.assign(meander, {
            characteristics: held.get(meander.id) ?? {},
          }),
        );
      }
    } while (after !== undefined);
  }

  /**
   * Counts the rows each of `keys` holds per shape, in one pass over the
   * bridge. Raw SQL, since the join spans three tables.
   */
  async patternShapeCounts(
    keys: readonly string[],
  ): Promise<MeanderPatternShapeCount[]> {
    const counted: {
      columns: string;
      count: string;
      key: string;
      rows: string;
    }[] = await this.meanderRepository.query(
      `SELECT catalog.key, meander.rows, meander.columns, COUNT(*) AS count
       FROM ${this.table(MeanderCharacteristic)} bridge
       JOIN ${this.table(Characteristic)} catalog ON catalog.id = bridge.characteristic_id
       JOIN ${this.table(Meander)} meander ON meander.id = bridge.meander_id
       WHERE catalog.key = ANY($1)
       GROUP BY catalog.key, meander.rows, meander.columns`,
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
   * Writes one meander row and its bridge rows. A Code already held is refused
   * by the unique index over `code`.
   */
  async save(record: MeanderRecord): Promise<Meander> {
    const { characteristics, ...row } = record;

    return this.meanderRepository.manager.transaction(async (manager) => {
      const meander = await manager.save(Meander, row);

      await this.writeCharacteristics(manager, [
        { characteristics, code: record.code },
      ]);

      return meander;
    });
  }

  /** Writes meander rows and bridge rows in one transaction, chunked. A duplicate Code rejects the batch. */
  async saveAll(records: readonly MeanderRecord[]): Promise<number> {
    const { columns } = this.meanderRepository.metadata;
    // A generated column, or one whose default is a SQL expression such as
    // `id`'s `uuidv7()`, is the database's to fill rather than the row's.
    const written = columns.filter(
      (column) => !column.isGenerated && typeof column.default !== "function",
    );
    const table = this.table(Meander);
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
        await this.writeCharacteristics(manager, chunk);
      }
    });

    return records.length;
  }

  /**
   * Makes the catalog hold exactly `entries`: upserts each by key and deletes
   * every other row, whose bridge rows cascade with it.
   */
  async syncCharacteristics(
    entries: readonly CharacteristicRecord[],
  ): Promise<void> {
    const keys = entries.map(({ key }) => key);

    await this.characteristicRepository.manager.transaction(async (manager) => {
      await manager.upsert(
        Characteristic,
        entries.map((entry) => ({ ...entry })),
        ["key"],
      );
      await manager
        .createQueryBuilder()
        .delete()
        .from(Characteristic)
        .where("NOT (key = ANY(:keys))", { keys })
        .execute();
    });
  }
}
