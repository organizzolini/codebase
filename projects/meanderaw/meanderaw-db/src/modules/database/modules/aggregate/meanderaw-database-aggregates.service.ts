import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Characteristic } from "../characteristic/characteristic.entity";
import { MeanderCharacteristic } from "../characteristic/meander-characteristic.entity";
import { Meander } from "../meander/meander.entity";

import { AggregateMarker } from "./aggregate-marker.entity";
import { CharacteristicPairCount } from "./characteristic-pair-count.entity";
import { CharacteristicShapeCount } from "./characteristic-shape-count.entity";
import { CharacteristicValueCount } from "./characteristic-value-count.entity";
import { ShapeCount } from "./shape-count.entity";

import type { EntityManager } from "typeorm";

/**
 * Rebuilds the aggregate count tables and each characteristic's `meanderCount`
 * in one transaction. Each table is built beside the live one and swapped in,
 * and the marker saying the tables are current is written last.
 */
@Injectable()
export class MeanderawDatabaseAggregatesService {
  // 🏗 Dependency Injection

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Fills a table beside `entity`'s from `select`, keys it, then swaps it in. */
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

  /** Rebuilds every count table and `meanderCount` in one transaction. */
  async rebuild(): Promise<void> {
    const bridge = this.table(MeanderCharacteristic);
    const catalog = this.table(Characteristic);
    const meanders = this.table(Meander);

    await this.dataSource.transaction("REPEATABLE READ", async (manager) => {
      // Writers wait, so no write can land between the counts and the marker.
      await manager.query(
        `LOCK TABLE ${meanders}, ${bridge}, ${catalog} IN SHARE MODE`,
      );
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
        `SELECT bridge.characteristic_id, meander.columns, COUNT(*) AS meander_count, meander.rows, bridge.value
         FROM ${bridge} bridge
         JOIN ${meanders} meander ON meander.id = bridge.meander_id
         GROUP BY bridge.characteristic_id, meander.columns, meander.rows, bridge.value`,
      );
      await this.swap(
        manager,
        ShapeCount,
        `SELECT columns, COUNT(*) AS meander_count, rows FROM ${meanders} GROUP BY columns, rows`,
      );
      await manager.query(
        `UPDATE ${catalog} catalog SET meander_count = COALESCE(
           (SELECT SUM(meander_count) FROM ${this.table(CharacteristicValueCount)} counts WHERE counts.characteristic_id = catalog.id), 0)`,
      );
      await manager.query(
        `INSERT INTO ${this.table(AggregateMarker)} (id, meander_count)
         SELECT 1, COUNT(*) FROM ${meanders}
         ON CONFLICT (id) DO UPDATE SET meander_count = EXCLUDED.meander_count`,
      );
    });
  }
}
