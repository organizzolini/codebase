import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Constellation } from "./constellation.entity";
import { Star } from "./star.entity";

import type { Relation } from "typeorm";

/**
 * One row of the `constellation_line` table: a segment of a constellation's
 * figure, drawn from one star to another, each named by its Hipparcos number.
 *
 * The key is the constellation and the pair, so a segment is stored once, and
 * every side cascades on delete.
 */
@Entity({ name: "constellation_line" })
@Index("constellation_line_from_hip", ["fromHip"])
@Index("constellation_line_to_hip", ["toHip"])
export class ConstellationLine {
  @JoinColumn({ name: "constellation_designation" })
  @ManyToOne(() => Constellation, { onDelete: "CASCADE" })
  constellation?: Relation<Constellation>;

  /** The constellation whose figure the segment belongs to. */
  @PrimaryColumn("text")
  constellationDesignation!: string;

  /** The star the segment starts at. */
  @PrimaryColumn("integer")
  fromHip!: number;

  @JoinColumn({ name: "from_hip" })
  @ManyToOne(() => Star, { onDelete: "CASCADE" })
  fromStar?: Relation<Star>;

  /** The star the segment ends at. */
  @PrimaryColumn("integer")
  toHip!: number;

  @JoinColumn({ name: "to_hip" })
  @ManyToOne(() => Star, { onDelete: "CASCADE" })
  toStar?: Relation<Star>;
}
