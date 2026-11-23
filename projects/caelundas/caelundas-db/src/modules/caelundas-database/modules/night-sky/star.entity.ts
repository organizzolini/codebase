import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  GraphIncomingEdges,
  GraphLabel,
  GraphOutgoingEdges,
} from "@codebase/persistence";

import { createBigintTransformer } from "../../caelundas-database.utilities";

import type { ConstellationEdge } from "./constellation.entity";
import type { Relation } from "typeorm";

/**
 * One row of the `stars` table: a star of the HYG catalog the night sky draws,
 * keyed by its Hipparcos number, at J2000.
 */
@Entity()
export class Star {
  /** The B−V color index, which sets the star's color. */
  @Column("real")
  colorIndex!: number;

  /** The declination in degrees. */
  @Column("real")
  declinationDegrees!: number;

  /** The Hipparcos catalog number, which constellation edges refer to. */
  @GraphLabel()
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  hip!: number;

  /** The edges of constellation figures that end at the star. */
  @GraphIncomingEdges("ConstellationEdge")
  incomingEdges?: Relation<ConstellationEdge>[];

  /** The apparent visual magnitude. */
  @Column("real")
  magnitude!: number;

  /** The edges of constellation figures that start at the star. */
  @GraphOutgoingEdges("ConstellationEdge")
  outgoingEdges?: Relation<ConstellationEdge>[];

  /** The right ascension in hours. */
  @Column("real")
  rightAscensionHours!: number;
}
