import { Column, Entity } from "typeorm";

import { PostgresqlDeletableEntity } from "../../src/modules/postgresql/entities/deletable.entity";

/**
 * A table for the integration suite: one column of its own, named in camel
 * case so the suite can see snake case applied, on every base column.
 */
@Entity({ name: "widgets" })
export class Widget extends PostgresqlDeletableEntity {
  @Column({ type: "text" })
  displayName!: string;
}
