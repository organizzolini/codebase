import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { createBigintTransformer } from "../caelundas-database.utilities";

import { Constellation } from "./constellation.entity";
import { Star } from "./star.entity";

import type { Relation } from "typeorm";

/**
 * One row of the `constellation_lines` table: a segment of a constellation's
 * figure, drawn from one star to another, each named by its Hipparcos number.
 *
 * The key is the constellation and the pair, so a segment is stored once, and
 * every side cascades on delete.
 */
@Entity()
@Index("constellation_lines_from_hip", ["fromHip"])
@Index("constellation_lines_to_hip", ["toHip"])
export class ConstellationLine {
  @JoinColumn({ name: "constellation_designation" })
  @ManyToOne(() => Constellation, { onDelete: "CASCADE" })
  constellation?: Relation<Constellation>;

  /** The constellation whose figure the segment belongs to. */
  @PrimaryColumn("text")
  constellationDesignation!: string;

  /** The star the segment starts at. */
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  fromHip!: number;

  @JoinColumn({ name: "from_hip" })
  @ManyToOne(() => Star, { onDelete: "CASCADE" })
  fromStar?: Relation<Star>;

  /** The star the segment ends at. */
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  toHip!: number;

  @JoinColumn({ name: "to_hip" })
  @ManyToOne(() => Star, { onDelete: "CASCADE" })
  toStar?: Relation<Star>;
}
