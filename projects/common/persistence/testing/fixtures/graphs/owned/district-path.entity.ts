import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import {
  Graph,
  GraphLabel,
  GraphSource,
  GraphTarget,
} from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

import { District } from "./district.entity";
import { Place } from "./place.entity";

import type { Relation } from "typeorm";

/**
 * A hand-written edge entity with an owner column of its own: each row says two
 * places of a district are joined.
 */
@Entity({ name: "district_paths" })
@Graph({ directed: false })
export class DistrictPath {
  @JoinColumn({ name: "district_code" })
  @ManyToOne(() => District, { onDelete: "CASCADE" })
  district?: Relation<District>;

  @GraphLabel()
  @PrimaryColumn({ name: "district_code", type: "text" })
  districtCode!: string;

  @JoinColumn({ name: "source_place" })
  @ManyToOne(() => Place, { onDelete: "CASCADE" })
  source?: Relation<Place>;

  @GraphSource()
  @PrimaryColumn({ name: "source_place", type: "integer" })
  sourcePlace!: number;

  @JoinColumn({ name: "target_place" })
  @ManyToOne(() => Place, { onDelete: "CASCADE" })
  target?: Relation<Place>;

  @GraphTarget()
  @PrimaryColumn({ name: "target_place", type: "integer" })
  targetPlace!: number;
}
