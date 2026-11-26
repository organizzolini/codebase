import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import { Measure } from "./measure.entity";
import { Metric } from "./metric.entity";

import type { Relation } from "typeorm";

/**
 * One node of a metric's expression tree, in `metric_expressions`: a measure, another metric, or an operator over its children.
 *
 * A seeded closure-table tree, like `tags`. It has no owner: a metric's `expression_id` names its root, and `position` orders operands.
 */
@Check(
  "metric_expressions_kind",
  `("kind" = 'measure' AND "measure_id" IS NOT NULL) OR ("kind" = 'metric' AND "metric_id" IS NOT NULL) OR ("kind" = 'operator' AND "operator" IS NOT NULL)`,
)
@Entity()
@Index("metric_expressions_parent_position", ["parentId", "position"], {
  unique: true,
  where: `"parent_id" IS NOT NULL`,
})
@Tree("closure-table", {
  ancestorColumnName: () => "ancestor_id",
  descendantColumnName: () => "descendant_id",
})
export class MetricExpression extends PostgresqlUpdatableEntity {
  @TreeChildren()
  children?: MetricExpression[];

  /** What the node is: `measure`, `metric` or `operator`. */
  @Column("text")
  kind!: string;

  @JoinColumn({ name: "measure_id" })
  @ManyToOne(() => Measure, { nullable: true, onDelete: "RESTRICT" })
  measure?: null | Relation<Measure>;

  /** The measure a measure node reads. */
  @Column("uuid", { nullable: true })
  measureId?: null | string;

  @JoinColumn({ name: "metric_id" })
  @ManyToOne(() => Metric, { nullable: true, onDelete: "RESTRICT" })
  metric?: null | Relation<Metric>;

  /** The metric a metric node reads. */
  @Column("uuid", { nullable: true })
  metricId?: null | string;

  /** The operator of an operator node, such as `divide`. */
  @Column("text", { nullable: true })
  operator?: null | string;

  @JoinColumn({ name: "parent_id" })
  @TreeParent({ onDelete: "CASCADE" })
  parent?: MetricExpression | null;

  /** The node it is an operand of, or none for the root. */
  @Column("uuid", { nullable: true })
  parentId?: null | string;

  /** Its place among its siblings, the operand order. */
  @Column("smallint")
  position!: number;
}
