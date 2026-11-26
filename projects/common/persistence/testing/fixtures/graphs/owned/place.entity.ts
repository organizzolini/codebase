import { Column, Entity, PrimaryColumn } from "typeorm";

import { GraphLabel } from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

/** A node of `DistrictPath`, keyed by its number and labelled by its title. */
@Entity({ name: "places" })
export class Place {
  @PrimaryColumn({ type: "integer" })
  number!: number;

  @Column({ type: "text" })
  @GraphLabel()
  title!: string;
}
