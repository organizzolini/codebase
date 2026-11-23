import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  Dag,
  GraphSource,
  GraphTarget,
} from "../../../../src/modules/graph-entities/graph-entities.utilities";

/** A DAG whose source is a property no column backs, which the read rejects. */
@Dag()
@Entity({ name: "broken_links" })
export class BrokenLink {
  @PrimaryColumn({ type: "integer" })
  id!: number;

  @GraphSource()
  origin!: string;

  @Column({ type: "text" })
  @GraphTarget()
  target!: string;
}
