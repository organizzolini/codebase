import { Column, Entity, Index } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

/**
 * One row of `dimensions`: a way events are sliced, such as a name, a day, a month or a tag.
 *
 * Seeded. The time dimensions form a graph in `dimension_edges`; `name` and `tag` are flat, their values the event names and the rows of `tags`.
 */
@Entity()
@Index("dimensions_slug", ["slug"], { unique: true })
export class Dimension extends PostgresqlUpdatableEntity {
  /** Its lucide icon slug. */
  @Column("text")
  icon!: string;

  /** What it is called. */
  @Column("text")
  name!: string;

  /** What its values are, in a sentence. */
  @Column("text")
  note!: string;

  /** Its name as a URL slug, unique. */
  @Column("text")
  slug!: string;
}
