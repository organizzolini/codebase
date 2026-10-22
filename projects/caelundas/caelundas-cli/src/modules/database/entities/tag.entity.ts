import {
  Column,
  Entity,
  Index,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

import { UpdatableEntity } from "@codebase/persistence";

/**
 * One node of the `tags` tree, in the schema that `CAELUNDAS_POSTGRES_SCHEMA`
 * names: a label an event can carry, such as a planet, a sign, or a kind of
 * event, nested under the broader label it refines.
 *
 * The tree has many roots, one per dimension. A tag's `name` is its own
 * label, unique among its siblings, so two partial unique indexes hold it:
 * one over a parent's children and one over the roots, which have no parent
 * to compare. A tag's full path is derived by walking its ancestors.
 *
 * The tree is a closure table, `tags_closure`, which TypeORM keeps in step
 * as tags are saved through a `TreeRepository`: it holds one row for every
 * ancestor and descendant pair, a tag's pair with itself included, so
 * ancestors, descendants, and depth, the number of ancestors, are plain
 * joins rather than recursive queries.
 */
@Entity({ name: "tags" })
@Index("tags_sibling_name", ["parent", "name"], {
  unique: true,
  where: `"parent_id" IS NOT NULL`,
})
@Index("tags_root_name", ["name"], {
  unique: true,
  where: `"parent_id" IS NULL`,
})
@Tree("closure-table", {
  ancestorColumnName: () => "ancestor_id",
  descendantColumnName: () => "descendant_id",
})
export class Tag extends UpdatableEntity {
  @TreeChildren()
  children?: Tag[];

  @Column("text", { comment: "The tag's own label, unique among its siblings" })
  name!: string;

  @JoinColumn({ name: "parent_id" })
  @TreeParent({ onDelete: "CASCADE" })
  parent?: null | Tag;

  @Column("uuid", {
    comment: "The tag this one refines, or null for the root of a dimension",
    nullable: true,
  })
  parentId?: null | string;
}
