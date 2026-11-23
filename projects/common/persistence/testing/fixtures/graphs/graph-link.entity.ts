import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  Graph,
  GraphSource,
  GraphTarget,
} from "../../../src/modules/graph-entities/graph-entities.utilities";

/** A general graph, which `render-dag-data` refuses to draw. */
@Entity({ name: "graph_links" })
@Graph({ directed: false })
export class GraphLink {
  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  @GraphSource()
  source!: string;

  @Column({ type: "text" })
  @GraphTarget()
  target!: string;
}
