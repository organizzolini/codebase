import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { CharacteristicPairCount } from "./entities/characteristic-pair-count.entity";
import { CharacteristicShapeCount } from "./entities/characteristic-shape-count.entity";
import { CharacteristicValueCount } from "./entities/characteristic-value-count.entity";
import { Characteristic } from "./entities/characteristic.entity";
import { MeanderCharacteristic } from "./entities/meander-characteristic.entity";
import { Meander } from "./entities/meander.entity";
import { ShapeCount } from "./entities/shape-count.entity";

import type { EntityManager } from "typeorm";

/**
 * Rebuilds the aggregate count tables, and each characteristic's
 * `meanderCount`, from the meanders and the bridge. Each table is built beside
 * the live one and swapped in, all in one transaction, so a reader sees the
 * old counts until the commit and the new ones after, never a half.
 */
@Injectable()
export class MeanderawDatabaseAggregatesService {
  // 🏗 Dependency Injection

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds `entity`'s table afresh from `select`, which yields the table's
   * columns under their own names, then swaps it in for the live one. The primary
   * key goes on after the load, under a temporary name, and takes the live
   * name once the old table is gone.
   */
  private async swap(
    manager: EntityManager,
    entity: new () => object,
    select: string,
  ): Promise<void> {
    const metadata = this.dataSource.getMetadata(entity);
    const live = this.table(entity);
    const next = live.replace(/"$/, '_next"');
    const columns = metadata.columns.map(
      ({ databaseName }) => `"${databaseName}"`,
    );
    const keys = metadata.primaryColumns.map(
      ({ databaseName }) => `"${databaseName}"`,
    );
    const constraint = metadata.primaryColumns[0]?.primaryKeyConstraintName;
    const [schema, name] = metadata.tablePath.split(".");

    await manager.query(
      `CREATE TABLE ${next} (LIKE ${live} INCLUDING DEFAULTS)`,
    );
    await manager.query(
      `INSERT INTO ${next} (${columns.join(", ")}) SELECT ${columns.join(", ")} FROM (${select}) AS counted`,
    );
    await manager.query(
      `ALTER TABLE ${next} ADD CONSTRAINT "${constraint}_next" PRIMARY KEY (${keys.join(", ")})`,
    );
    await manager.query(`DROP TABLE ${live}`);
    await manager.query(`ALTER TABLE ${next} RENAME TO "${name}"`);
    await manager.query(
      `ALTER INDEX "${schema}"."${constraint}_next" RENAME TO "${constraint}"`,
    );
  }

  /** A table's schema-qualified, quoted name, for raw SQL. */
  private table(entity: new () => object): string {
    return this.dataSource
      .getMetadata(entity)
      .tablePath.split(".")
      .map((part) => `"${part}"`)
      .join(".");
  }

  // 🌎 Public Methods

  /**
   * Rebuilds every count table and `characteristics.meanderCount` in one
   * transaction. Only true booleans and numbers above 0 are counted, as in
   * the bridge, so a 0 or false bucket is the shape total minus these rows.
   */
  async rebuild(): Promise<void> {
    const bridge = this.table(MeanderCharacteristic);
    const catalog = this.table(Characteristic);
    const meanders = this.table(Meander);

    await this.dataSource.transaction(async (manager) => {
      await this.swap(
        manager,
        CharacteristicValueCount,
        `SELECT characteristic_id, value, COUNT(*) AS meander_count FROM ${bridge} GROUP BY characteristic_id, value`,
      );
      await this.swap(
        manager,
        CharacteristicPairCount,
        `SELECT held.characteristic_id, other.characteristic_id AS other_characteristic_id, other.value AS other_value, held.value, COUNT(*) AS meander_count
         FROM ${bridge} held
         JOIN ${catalog} catalog ON catalog.id = held.characteristic_id AND catalog.value_type = 'boolean'
         JOIN ${bridge} other ON other.meander_id = held.meander_id
         GROUP BY held.characteristic_id, held.value, other.characteristic_id, other.value`,
      );
      await this.swap(
        manager,
        CharacteristicShapeCount,
        `SELECT bridge.characteristic_id, meander.columns, meander.lattice, COUNT(*) AS meander_count, meander.rows, bridge.value
         FROM ${bridge} bridge
         JOIN ${meanders} meander ON meander.id = bridge.meander_id
         GROUP BY bridge.characteristic_id, meander.columns, meander.lattice, meander.rows, bridge.value`,
      );
      await this.swap(
        manager,
        ShapeCount,
        `SELECT columns, lattice, COUNT(*) AS meander_count, rows FROM ${meanders} GROUP BY columns, lattice, rows`,
      );
      await manager.query(
        `UPDATE ${catalog} catalog SET meander_count = COALESCE(
           (SELECT SUM(meander_count) FROM ${this.table(CharacteristicValueCount)} counts WHERE counts.characteristic_id = catalog.id), 0)`,
      );
    });
  }
}
