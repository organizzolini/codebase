import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  Dag,
  GraphSource,
  GraphTarget,
} from "../../../src/modules/graph-entities/graph-entities.utilities";

/** A second DAG, of numeric step ids with no label or weight, in a named schema. */
@Dag()
@Entity({ name: "step_links", schema: "fixture" })
export class StepLink {
  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "integer" })
  @GraphSource()
  source!: number;

  @Column({ type: "integer" })
  @GraphTarget()
  target!: number;
}
