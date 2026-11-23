import { Column, Entity, PrimaryColumn } from "typeorm";

import { Graph, GraphEdges, GraphLabel } from "@codebase/persistence";

import { Star } from "./star.entity";

import type { GraphEdgeRow } from "@codebase/persistence";
import type { Relation } from "typeorm";

/** One segment of a figure, between two stars by Hipparcos number. */
export type ConstellationEdge = GraphEdgeRow<
  Constellation,
  Star,
  { constellationDesignation?: string; fromHip: number; toHip: number }
>;

/**
 * One row of the `constellations` table: one of the 88 IAU constellations,
 * keyed by its three-letter designation.
 *
 * The `@Graph` generates the `constellation_edges` table of its figure's
 * segments, keyed by the constellation and the pair of stars, which a save of
 * the constellation writes through `edges`.
 */
@Entity()
@Graph({ directed: false, edge: "ConstellationEdge", nodes: () => Star })
export class Constellation {
  /** The IAU designation, such as `UMa`. */
  @PrimaryColumn("text")
  designation!: string;

  /** The segments of its figure, each joining two stars. */
  @GraphEdges("ConstellationEdge")
  edges?: Relation<ConstellationEdge>[];

  /** The Latin name, such as `Ursa Major`, which titles its figure's diagram. */
  @Column("text")
  @GraphLabel()
  name!: string;

  /** Whether the ecliptic crosses it as one of the twelve zodiac signs. */
  @Column("boolean")
  zodiac!: boolean;
}
