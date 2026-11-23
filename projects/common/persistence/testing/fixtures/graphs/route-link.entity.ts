import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  Graph,
  GraphLabel,
  GraphSource,
  GraphTarget,
  GraphWeight,
} from "../../../src/modules/graph-entities/graph-entities.utilities";

/** A directed graph of routes: each row says its source stop leads to its target stop. */
@Entity({ name: "route_links" })
@Graph()
export class RouteLink {
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
