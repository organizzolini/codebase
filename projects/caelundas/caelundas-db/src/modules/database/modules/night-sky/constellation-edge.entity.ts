import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import {
  Graph,
  GraphLabel,
  GraphSource,
  GraphTarget,
} from "@codebase/persistence";

import { createBigintTransformer } from "../../database.utilities";

import type { Constellation } from "./constellation.entity";
import type { Star } from "./star.entity";
import type { Relation } from "typeorm";

/**
 * One row of the `constellation_edges` table: one segment of a constellation's
 * figure, between two stars by Hipparcos number.
 *
 * A hand-written `@Graph` edge: the constellation owns its segments, so the
 * edge carries its own `constellation_id`, which titles the figure's diagram.
 */
@Entity()
@Graph({ directed: false })
@Index("constellation_edges_source_node", ["sourceNode"])
@Index("constellation_edges_target_node", ["targetNode"])
export class ConstellationEdge {
  /** The constellation. */
  @JoinColumn({ name: "constellation_id" })
  @ManyToOne("Constellation", "edges", { onDelete: "CASCADE" })
  constellation?: Relation<Constellation>;

  /** The designation of the constellation whose figure the segment is in. */
  @GraphLabel()
  @PrimaryColumn("text")
  constellationId!: string;

  /** The star the segment starts at. */
  @JoinColumn({ name: "source_node" })
  @ManyToOne("Star", "outgoingEdges", { onDelete: "CASCADE" })
  source?: Relation<Star>;

  /** The Hipparcos number of the star the segment starts at. */
  @GraphSource()
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  sourceNode!: number;

  /** The star the segment ends at. */
  @JoinColumn({ name: "target_node" })
  @ManyToOne("Star", "incomingEdges", { onDelete: "CASCADE" })
  target?: Relation<Star>;

  /** The Hipparcos number of the star the segment ends at. */
  @GraphTarget()
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  targetNode!: number;
}
