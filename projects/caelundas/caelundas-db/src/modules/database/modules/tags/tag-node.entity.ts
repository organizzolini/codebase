import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import { createBigintTransformer } from "../../database.utilities";

/**
 * One row of the `tag_nodes` table: a tag with its depth, root and path, derived by `refreshReadModel` from the tag closure.
 */
@Entity()
@Index("tag_nodes_root_depth", ["rootId", "depth"])
@Index("tag_nodes_path", ["path"])
export class TagNode {
  /** The number of ancestors the tag has, so a root is 0. */
  @Column({ transformer: createBigintTransformer(), type: "bigint" })
  depth!: number;

  /** The id of the tag this row describes. */
  @PrimaryColumn("uuid")
  id!: string;

  /** The tag's own label. */
  @Column("text")
  name!: string;

  /** The tag's names from its root down, joined with ` / `. */
  @Column("text")
  path!: string;

  /** The root of the tag's dimension. */
  @Column("uuid")
  rootId!: string;
}
