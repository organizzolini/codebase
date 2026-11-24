import { Column, Entity, PrimaryColumn } from "typeorm";

import { GraphEdges } from "../../../../src/modules/render/modules/render-entities/render-entities-generated.utilities";
import {
  Graph,
  GraphLabel,
} from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

import { Station } from "./station.entity";

import type { GraphEdgeRow } from "../../../../src/modules/render/modules/render-entities/render-entities.types";
import type { Relation } from "typeorm";

/**
 * An undirected graph that generates its own edge entity: each row of
 * `networks` is one line, titled by its `title`, joining two stations.
 */
@Entity({ name: "networks" })
@Graph({ directed: false, edge: "NetworkLine", nodes: () => Station })
export class Network {
  @PrimaryColumn({ type: "text" })
  code!: string;

  @GraphEdges("NetworkLine")
  lines?: Relation<GraphEdgeRow<Network, Station>>[];

  @Column({ type: "text" })
  @GraphLabel()
  title!: string;
}
