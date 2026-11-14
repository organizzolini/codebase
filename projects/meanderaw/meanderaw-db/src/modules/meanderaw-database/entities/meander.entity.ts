import { Column, Entity, Index } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import { BIGINT_NUMBER_TRANSFORMER } from "../meanderaw-database.constants";

/**
 * One row of the `meanders` table: a single meander addressed by its Code.
 * `lattice`, `rows`, and `columns` sit beside it for filtering, and
 * `isHardcoded` records whether it came from the historical corpus. The
 * characteristics it holds live in `meander_characteristics`.
 */
@Entity({ name: "meanders" })
@Index(["code"], { unique: true })
@Index(["rows", "columns", "code"])
export class Meander extends PostgresqlUpdatableEntity {
  @Column({ type: "text" })
  code!: string;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  columns!: number;

  @Column({ type: "boolean" })
  isHardcoded!: boolean;

  @Column({ type: "text" })
  lattice!: string;

  @Column({
    default: 1,
    transformer: BIGINT_NUMBER_TRANSFORMER,
    type: "bigint",
  })
  repeats!: number;

  @Column({ transformer: BIGINT_NUMBER_TRANSFORMER, type: "bigint" })
  rows!: number;

  /** Sorted Codes of this class's other members; empty when none. */
  @Column({ default: "", type: "simple-array" })
  symmetricalCodes!: string[];
}
