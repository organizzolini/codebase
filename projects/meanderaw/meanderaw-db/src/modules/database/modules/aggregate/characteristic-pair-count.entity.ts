import { Column, Entity, PrimaryColumn } from "typeorm";

import { BIGINT_NUMBER_TRANSFORMER } from "../../database.constants";

/**
 * One row of `characteristic_pair_counts`: how many meanders hold a boolean
 * characteristic, crossed with how many of those hold another characteristic
 * at one value. Only true booleans are stored, so `value` is always 1, and
 * the false half is derived. Rebuilt whole by the aggregate step.
 */
@Entity({ name: "characteristic_pair_counts" })
export class CharacteristicPairCount {
  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_pair_counts",
    type: "smallint",
  })
  characteristicId!: number;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  meanderCount!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_pair_counts",
    type: "smallint",
  })
  otherCharacteristicId!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_pair_counts",
    type: "double precision",
  })
  otherValue!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_pair_counts",
    type: "double precision",
  })
  value!: number;
}
