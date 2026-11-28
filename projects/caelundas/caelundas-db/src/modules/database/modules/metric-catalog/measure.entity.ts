import { Check, Column, Entity, Index } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

/**
 * One row of the `measures` table: a thing measured about a group of events, in the catalog only.
 *
 * Reference data the migration seeds. How a measure is computed from `calendar_event_facts` lives in the API's registry, keyed by `slug`.
 */
@Check("measures_unit", `"unit" in ('count', 'duration', 'instant', 'none')`)
@Entity()
@Index("measures_slug", ["slug"], { unique: true })
export class Measure extends PostgresqlUpdatableEntity {
  /** Its lucide icon slug. */
  @Column("text")
  icon!: string;

  /** What it is called. */
  @Column("text")
  name!: string;

  /** What it measures, in a sentence. */
  @Column("text")
  note!: string;

  /** Its name as a URL slug, unique. */
  @Column("text")
  slug!: string;

  /** `count`, `duration` (seconds), `instant` (epoch milliseconds) or `none`. */
  @Column("text")
  unit!: string;
}
