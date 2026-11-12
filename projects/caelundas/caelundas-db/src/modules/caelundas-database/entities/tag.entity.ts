import {
  Column,
  Entity,
  Index,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

/**
 * One node of the `tags` tree: a label an event can carry, nested under the label it refines, with ancestors kept in `tags_closure`.
 */
@Entity()
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
export class Tag extends PostgresqlUpdatableEntity {
  @TreeChildren()
  children?: Tag[];

  /** The tag's own label, unique among its siblings. */
  @Column("text")
  name!: string;

  @JoinColumn({ name: "parent_id" })
  @TreeParent({ onDelete: "CASCADE" })
  parent?: null | Tag;

  /** The tag this refines, or null for a dimension root. */
  @Column("uuid", { nullable: true })
  parentId?: null | string;
}
