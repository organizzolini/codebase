import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { GraphLabel } from "@codebase/persistence";

import { createBigintTransformer } from "../../database.utilities";

import type { ConstellationEdge } from "./constellation-edge.entity";
import type { Relation } from "typeorm";

/**
 * One row of the `stars` table: a star of the HYG catalog the night sky draws,
 * keyed by its Hipparcos number, at J2000.
 *
 * Its color index, magnitude and coordinates are Postgres `real`s, 4-byte floats.
 */
@Entity()
export class Star {
  /** The B−V color index (blue minus visual magnitude): −0.3 hot, +2 red. */
  @Column("real")
  colorIndex!: number;

  /** The declination in degrees. */
  @Column("real")
  declinationDegrees!: number;

  /** The Hipparcos catalog number, which constellation edges refer to. */
  @GraphLabel()
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  hipparcosNumber!: number;

  /** The edges of constellation figures that end at the star. */
  @OneToMany("ConstellationEdge", "target")
  incomingEdges?: Relation<ConstellationEdge>[];

  /** The apparent visual magnitude. */
  @Column("real")
  magnitude!: number;

  /** The edges of constellation figures that start at the star. */
  @OneToMany("ConstellationEdge", "source")
  outgoingEdges?: Relation<ConstellationEdge>[];

  /** The right ascension in hours. */
  @Column("real")
  rightAscensionHours!: number;
}
