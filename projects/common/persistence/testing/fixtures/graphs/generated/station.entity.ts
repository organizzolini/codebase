import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  GraphIncomingEdges,
  GraphOutgoingEdges,
} from "../../../../src/modules/render/modules/render-entities/render-entities-generated.utilities";
import { GraphLabel } from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

import type { GraphEdgeRow } from "../../../../src/modules/render/modules/render-entities/render-entities.types";
import type { Relation } from "typeorm";

/** A node of `Network`, keyed by its number and labelled by its title. */
@Entity({ name: "stations" })
export class Station {
  @GraphIncomingEdges("NetworkLine")
  incomingLines?: Relation<GraphEdgeRow<Station>>[];

  @PrimaryColumn({ type: "integer" })
  number!: number;

  @GraphOutgoingEdges("NetworkLine")
  outgoingLines?: Relation<GraphEdgeRow<Station>>[];

  @Column({ type: "text" })
  @GraphLabel()
  title!: string;
}
