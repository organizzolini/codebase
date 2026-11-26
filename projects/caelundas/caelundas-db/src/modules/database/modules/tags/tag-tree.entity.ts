import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `tag_trees`: a tag and one of its descendants, itself included.
 *
 * Every path of `tag_edges` is walked, so a pair appears once however many paths join it. The metrics refresh refreshes it first.
 */
@Index("tag_trees_ancestor_id_descendant_id", ["ancestorId", "descendantId"], {
  unique: true,
})
@Index("tag_trees_descendant_id", ["descendantId"])
@ViewEntity({
  expression: `with recursive walk as (
    select id as ancestor_id, id as descendant_id from tags
    union
    select w.ancestor_id, e.target_node
    from walk as w
    inner join tag_edges as e on e.source_node = w.descendant_id
)
select ancestor_id, descendant_id from walk`,
  materialized: true,
  name: "tag_trees",
})
export class TagTree {
  /** The tag that holds the descendant. */
  @ViewColumn()
  ancestorId!: string;

  /** The tag beneath, or the ancestor itself. */
  @ViewColumn()
  descendantId!: string;
}
