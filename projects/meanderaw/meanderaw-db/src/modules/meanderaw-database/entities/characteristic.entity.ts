import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

import { BIGINT_NUMBER_TRANSFORMER } from "../meanderaw-database.constants";

/**
 * One row of the `characteristics` catalog: a characteristic the draw run
 * measures, described once. Each draw run rewrites it from the registered
 * evaluators, so a removed evaluator's row, and its bridge rows, go with it.
 */
@Entity({ name: "characteristics" })
@Index(["key"], { unique: true })
export class Characteristic {
  /** Where it is measured: `submatrix`, `path`, or `compound`. */
  @Column({ type: "text" })
  category!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ nullable: true, type: "text" })
  documentationUrl!: null | string;

  @Column({ nullable: true, type: "text" })
  formula!: null | string;

  @PrimaryGeneratedColumn("identity", {
    generatedIdentity: "BY DEFAULT",
    type: "smallint",
  })
  id!: number;

  /** Whether it names a kind of meander. */
  @Column({ type: "boolean" })
  isPattern!: boolean;

  /** The name the evaluator registers it under. */
  @Column({ type: "text" })
  key!: string;

  /** How many meanders hold it, rebuilt by the aggregate step. */
  @Column({
    default: 0,
    transformer: BIGINT_NUMBER_TRANSFORMER,
    type: "bigint",
  })
  meanderCount!: number;

  @Column({ type: "text" })
  name!: string;

  /** `number` or `boolean`; a boolean is stored as 1. */
  @Column({ type: "text" })
  valueType!: string;
}
