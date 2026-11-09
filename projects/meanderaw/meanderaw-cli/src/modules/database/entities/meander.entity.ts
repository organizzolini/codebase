import { Column, Entity, Index } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import { BIGINT_NUMBER_TRANSFORMER } from "../database.constants";

import type { StoredCharacteristics } from "../../characteristics/characteristics.types";

/**
 * One row of the `meanders` table: a single meander addressed by its Code.
 * `lattice`, `rows`, and `columns` sit beside it for filtering, and
 * `isHardcoded` records whether it came from the historical corpus.
 */
@Entity({ name: "meanders" })
@Index(["code"], { unique: true })
@Index(["rows", "columns", "code"])
export class Meander extends PostgresqlUpdatableEntity {
  /**
   * Every Characteristic, as one sparse JSON object. A missing key means zero
   * or `false`, so raw SQL must `COALESCE` it.
   */
  @Column({ type: "jsonb" })
  characteristics!: StoredCharacteristics;

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

  /**
   * The Codes of this meander's other symmetry-class members, sorted; empty
   * when every reflection maps the meander onto itself.
   */
  @Column({ default: "", type: "simple-array" })
  symmetricalCodes!: string[];
}
