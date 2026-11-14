import { Column, Entity, PrimaryColumn } from "typeorm";

import { BIGINT_NUMBER_TRANSFORMER } from "../meanderaw-database.constants";

/**
 * One row of `shape_counts`: how many meanders one shape (rows, columns,
 * lattice) holds in all. It is the total every 0 or false bucket is derived
 * from. Rebuilt whole by the aggregate step.
 */
@Entity({ name: "shape_counts" })
export class ShapeCount {
  @PrimaryColumn({
    primaryKeyConstraintName: "PK_shape_counts",
    transformer: BIGINT_NUMBER_TRANSFORMER,
    type: "bigint",
  })
  columns!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_shape_counts",
    type: "text",
  })
  lattice!: string;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  meanderCount!: number;

  @PrimaryColumn({
    primaryKeyConstraintName: "PK_shape_counts",
    transformer: BIGINT_NUMBER_TRANSFORMER,
    type: "bigint",
  })
  rows!: number;
}
