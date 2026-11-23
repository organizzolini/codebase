import { Column, Entity, PrimaryColumn } from "typeorm";

import { GraphLabel } from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

/** A node of `Pipeline`, keyed by its code and labelled by its name. */
@Entity({ name: "jobs" })
export class Job {
  @PrimaryColumn({ type: "text" })
  code!: string;

  @Column({ type: "text" })
  @GraphLabel()
  name!: string;
}
