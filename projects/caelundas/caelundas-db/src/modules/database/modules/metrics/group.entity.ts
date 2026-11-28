import { Column, Entity, Index } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

/**
 * One row of the `groups` table: a set of dimensions, such as a day, a tag, or a day and a tag together.
 *
 * Reference data the migration seeds; `group_dimensions` lists the dimensions of each. A filter instantiates one group by pinning a value for each of its dimensions.
 */
@Entity()
@Index("groups_slug", ["slug"], { unique: true })
export class Group extends PostgresqlUpdatableEntity {
  /** Its lucide icon slug. */
  @Column("text")
  icon!: string;

  /** What it is called. */
  @Column("text")
  name!: string;

  /** What its filters are, in a sentence. */
  @Column("text")
  note!: string;

  /** Its name as a URL slug, unique. */
  @Column("text")
  slug!: string;
}
