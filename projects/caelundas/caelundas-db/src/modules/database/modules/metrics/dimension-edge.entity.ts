import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Graph, GraphSource, GraphTarget } from "@codebase/persistence";

import { Dimension } from "./dimension.entity";

import type { Relation } from "typeorm";

/**
 * One row of `dimension_edges`: a time dimension and the coarser one it rolls up into.
 *
 * A `@Graph` edge, since a day has two parents. The source is the finer dimension and the target the coarser: day to week and month, month to quarter, quarter to year.
 */
@Entity()
@Graph({ directed: true })
@Index("dimension_edges_target_node", ["targetNode"])
export class DimensionEdge {
  @JoinColumn({ name: "source_node" })
  @ManyToOne(() => Dimension, { onDelete: "CASCADE" })
  source?: Relation<Dimension>;

  /** The finer dimension. */
  @GraphSource()
  @PrimaryColumn("uuid")
  sourceNode!: string;

  @JoinColumn({ name: "target_node" })
  @ManyToOne(() => Dimension, { onDelete: "CASCADE" })
  target?: Relation<Dimension>;

  /** The coarser dimension it rolls up into. */
  @GraphTarget()
  @PrimaryColumn("uuid")
  targetNode!: string;
}
