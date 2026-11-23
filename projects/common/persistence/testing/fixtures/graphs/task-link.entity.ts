import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  DirectedAcyclicGraph,
  GraphLabel,
  GraphSource,
  GraphTarget,
  GraphWeight,
} from "../../../src/modules/render/modules/render-entities/render-entities.utilities";

/** A directed acyclic graph of tasks: each row says its source task blocks its target task. */
@DirectedAcyclicGraph()
@Entity({ name: "task_links" })
export class TaskLink {
  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ nullable: true, type: "text" })
  @GraphLabel()
  label!: null | string;

  @Column({ type: "text" })
  @GraphSource()
  source!: string;

  @Column({ type: "text" })
  @GraphTarget()
  target!: string;

  @Column({ nullable: true, type: "double precision" })
  @GraphWeight()
  weight!: null | number;
}
