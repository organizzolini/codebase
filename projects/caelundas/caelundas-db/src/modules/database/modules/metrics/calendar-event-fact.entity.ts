import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Measure } from "../metric-catalog/measure.entity";

import { Filter } from "./filter.entity";

import type { Relation } from "typeorm";

/**
 * One row of `calendar_event_facts`: one measure at one filter.
 *
 * The key is the pair. The value is in the measure's unit, an instant in epoch milliseconds. A zero has no row, nor has a measure that does not merge. A refresh writes only what changed.
 */
@Entity({
  comment:
    "One measure at one filter. The facts are those of the default scope by definition: every event except the Forming and Dissolving phase boundaries (tags Aspect / Phase / Forming and Dissolving).",
})
export class CalendarEventFact {
  @JoinColumn({ name: "filter_id" })
  @ManyToOne(() => Filter, { onDelete: "CASCADE" })
  filter?: Relation<Filter>;

  /** The filter measured. */
  @PrimaryColumn("uuid")
  filterId!: string;

  @JoinColumn({ name: "measure_id" })
  @ManyToOne(() => Measure, { onDelete: "RESTRICT" })
  measure?: Relation<Measure>;

  /** The measure taken. */
  @PrimaryColumn("uuid")
  measureId!: string;

  /** The measurement, in the unit of its measure. */
  @Column("double precision")
  measurement!: number;
}
