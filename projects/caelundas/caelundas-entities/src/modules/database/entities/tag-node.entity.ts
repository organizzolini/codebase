import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * One row of the `tag_nodes` table: a tag with its place in the tag tree, kept
 * as a table rather than a view because deriving the depth, root, and path of
 * a tag takes a correlated subquery that every grouping and filter on a tag
 * would pay again.
 *
 * The table is derived: `DatabaseService.refreshReadModel` rebuilds it from
 * `tags` and `tags_closure`, so nothing else writes it.
 */
@Entity({ name: "tag_nodes" })
export class TagNode {
  /** The number of ancestors the tag has, so a root is 0. */
  @Column("integer")
  depth!: number;

  /** The id of the tag this row describes. */
  @PrimaryColumn("varchar")
  id!: string;

  /** The tag's own label. */
  @Column("text")
  name!: string;

  /** The tag's names from its root down, joined with ` / `. */
  @Column("text")
  path!: string;

  /** The root of the tag's dimension. */
  @Column("varchar")
  rootId!: string;
}
