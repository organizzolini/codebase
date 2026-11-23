import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  Dag,
  GraphLabel,
  GraphSource,
  GraphTarget,
  GraphWeight,
} from "../../../src/modules/graph-entities/graph-entities.utilities";

/** A DAG of tasks: each row says its source task blocks its target task. */
@Dag()
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
