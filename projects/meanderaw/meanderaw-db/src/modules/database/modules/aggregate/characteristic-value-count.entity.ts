import { Column, Entity, PrimaryColumn } from "typeorm";

import { BIGINT_NUMBER_TRANSFORMER } from "../../database.constants";

/**
 * One row of `characteristic_value_counts`: how many meanders hold one
 * characteristic at one value. The 0 or false bucket has no row; it is the
 * shape totals minus these. Rebuilt whole by the aggregate step.
 */
@Entity({ name: "characteristic_value_counts" })
export class CharacteristicValueCount {
  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_value_counts",
    type: "smallint",
  })
  characteristicId!: number;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  meanderCount!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_value_counts",
    type: "double precision",
  })
  value!: number;
}
