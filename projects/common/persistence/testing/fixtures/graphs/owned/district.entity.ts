import { Column, Entity, PrimaryColumn } from "typeorm";

import { GraphLabel } from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

/** The owner of the paths of `DistrictPath`, keyed by its code and titled by its name. */
@Entity({ name: "districts" })
export class District {
  @PrimaryColumn({ type: "text" })
  code!: string;

  @Column({ type: "text" })
  @GraphLabel()
  name!: string;
}
