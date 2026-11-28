import { Column, Entity, PrimaryColumn } from "typeorm";

import { Graph } from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

import { Station } from "./station.entity";

/**
 * An undirected graph that generates its own edge entity: each row of
 * `networks` is one network, and its edges join two stations.
 */
@Entity({ name: "networks" })
@Graph({ directed: false, edge: "NetworkLine", nodes: () => Station })
export class Network {
  @PrimaryColumn({ type: "text" })
  code!: string;

  @Column({ type: "text" })
  title!: string;
}
