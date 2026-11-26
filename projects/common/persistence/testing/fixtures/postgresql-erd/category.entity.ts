import { Entity, Tree, TreeChildren, TreeParent } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

/** A closure-table tree, whose `erd_categories_closure` table TypeORM generates. */
@Entity({ name: "erd_categories" })
@Tree("closure-table")
export class ErdCategory extends PostgresqlIdentifiableEntity {
  @TreeChildren()
  children?: ErdCategory[];

  @TreeParent()
  parent?: ErdCategory;
}
