import { Column, Entity, PrimaryColumn } from "typeorm";

import { Graph } from "../../../../src/modules/render/modules/render-entities/render-entities.utilities";

/**
 * A tree whose nodes may have several parents: a `@Graph` whose generated edge
 * joins its own rows, so a shelf can sit under more than one.
 */
@Entity({ name: "shelf_tags" })
@Graph({ edge: "ShelfLink", nodes: () => ShelfTag })
export class ShelfTag {
  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  name!: string;
}
