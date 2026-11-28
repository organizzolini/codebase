import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { GraphLabel } from "@codebase/persistence";

import type { ConstellationEdge } from "./constellation-edge.entity";
import type { Relation } from "typeorm";

/**
 * One row of the `constellations` table: one of the 88 IAU constellations,
 * keyed by its three-letter designation.
 *
 * It owns the segments of its figure, the `constellation_edges` rows keyed by
 * its designation (`constellation_id`) and the pair of stars, which a save of
 * the constellation writes through `edges`.
 */
@Entity()
export class Constellation {
  /** The IAU designation, such as `UMa`. */
  @PrimaryColumn("text")
  designation!: string;

  /** The segments of its figure, each joining two stars. */
  @OneToMany("ConstellationEdge", "constellation", { cascade: ["insert"] })
  edges?: Relation<ConstellationEdge>[];

  /** Whether the ecliptic crosses it as one of the twelve zodiac signs. */
  @Column("boolean")
  isZodiac!: boolean;

  /** The Latin name, such as `Ursa Major`, which titles its figure's diagram. */
  @Column("text")
  @GraphLabel()
  name!: string;
}
