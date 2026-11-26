import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  DirectedAcyclicGraph,
  GraphLabel,
} from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

import { Job } from "./job.entity";

/**
 * A directed acyclic graph that generates its own edge entity: each row of
 * `pipelines` is one pipeline, whose edges say a job waits for another. It
 * names its two columns itself, in place of `source_node` and `target_node`.
 */
@DirectedAcyclicGraph({
  edge: "PipelineDependency",
  nodes: () => Job,
  sourceColumn: "fromCode",
  targetColumn: "toCode",
})
@Entity({ name: "pipelines" })
export class Pipeline {
  @PrimaryColumn({ type: "text" })
  code!: string;

  @Column({ type: "text" })
  @GraphLabel()
  title!: string;
}
