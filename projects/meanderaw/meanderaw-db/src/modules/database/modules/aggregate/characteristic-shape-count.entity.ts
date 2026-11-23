import { Column, Entity, PrimaryColumn } from "typeorm";

import { BIGINT_NUMBER_TRANSFORMER } from "../../database.constants";

/**
 * One row of `characteristic_shape_counts`: how many meanders of one shape
 * (rows, columns) hold one characteristic at one value. The 0 or
 * false bucket is the shape's total minus these. Rebuilt whole by the
 * aggregate step.
 */
@Entity({ name: "characteristic_shape_counts" })
export class CharacteristicShapeCount {
  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_shape_counts",
    type: "smallint",
  })
  characteristicId!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_shape_counts",
    transformer: BIGINT_NUMBER_TRANSFORMER,
    type: "bigint",
  })
  columns!: number;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  meanderCount!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_shape_counts",
    transformer: BIGINT_NUMBER_TRANSFORMER,
    type: "bigint",
  })
  rows!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_characteristic_shape_counts",
    type: "double precision",
  })
  value!: number;
}
