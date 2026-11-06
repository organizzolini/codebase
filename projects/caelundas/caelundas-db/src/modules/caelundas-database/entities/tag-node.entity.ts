import { Column, Entity, PrimaryColumn } from "typeorm";

import { createBigintTransformer } from "../caelundas-database.utilities";

/**
 * One row of the `tag_nodes` table: a tag with its place in the tag tree, kept
 * as a table rather than a view because deriving the depth, root, and path of
 * a tag takes a join over the closure that every grouping and filter on a tag
 * would pay again.
 *
 * The table is derived: `CaelundasDatabaseService.refreshReadModel` rebuilds
 * it from `tags` and `tags_closure`, so nothing else writes it. Its `id` is
 * the tag's own, copied rather than assigned.
 */
@Entity()
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
