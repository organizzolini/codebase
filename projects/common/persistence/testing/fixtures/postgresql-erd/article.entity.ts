import { Entity, JoinTable, ManyToMany } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

import { ErdCategory } from "./category.entity";

/** An article in many categories, whose `erd_articles_categories` join table TypeORM generates. */
@Entity({ name: "erd_articles" })
export class ErdArticle extends PostgresqlIdentifiableEntity {
  @JoinTable()
  @ManyToMany(() => ErdCategory)
  categories?: ErdCategory[];
}
