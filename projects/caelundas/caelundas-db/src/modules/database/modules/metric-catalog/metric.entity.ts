import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import type { MetricExpression } from "./metric-expression.entity";
import type { Relation } from "typeorm";

/**
 * One row of the `metrics` table: a number the interface shows for a group of events, and the root of its expression tree.
 *
 * Seeded reference data. `expression_id` names the root node in `metric_expressions`, null only while the seed is written.
 */
@Check("metrics_unit", `"unit" in ('count', 'duration', 'instant', 'none')`)
@Entity()
@Index("metrics_slug", ["slug"], { unique: true })
@Index("metrics_expression_id", ["expressionId"], { unique: true })
export class Metric extends PostgresqlUpdatableEntity {
  @JoinColumn({ name: "expression_id" })
  @ManyToOne("MetricExpression", { nullable: true, onDelete: "SET NULL" })
  expression?: null | Relation<MetricExpression>;

  /** The root node of its expression tree, which no other metric shares. */
  @Column("uuid", { nullable: true })
  expressionId?: null | string;

  /** Its lucide icon slug. */
  @Column("text")
  icon!: string;

  /** What it is called. */
  @Column("text")
  name!: string;

  /** What it shows, in a sentence. */
  @Column("text")
  note!: string;

  /** Its name as a URL slug, unique. */
  @Column("text")
  slug!: string;

  /** `count`, `duration` (seconds), `instant` (epoch milliseconds) or `none`. */
  @Column("text")
  unit!: string;
}
