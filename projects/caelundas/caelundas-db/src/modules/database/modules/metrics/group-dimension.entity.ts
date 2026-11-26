import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Dimension } from "./dimension.entity";
import { Group } from "./group.entity";

import type { Relation } from "typeorm";

/**
 * One row of the `group_dimensions` join table: a dimension a group is a set of.
 *
 * The key is the pair, so a group holds a dimension once; both sides cascade on delete.
 */
@Entity()
@Index("group_dimensions_group_id_dimension_id", ["groupId", "dimensionId"])
export class GroupDimension {
  @JoinColumn({ name: "dimension_id" })
  @ManyToOne(() => Dimension, { onDelete: "CASCADE" })
  dimension?: Relation<Dimension>;

  /** The dimension in the group. */
  @PrimaryColumn("uuid")
  dimensionId!: string;

  @JoinColumn({ name: "group_id" })
  @ManyToOne(() => Group, { onDelete: "CASCADE" })
  group?: Relation<Group>;

  /** The group. */
  @PrimaryColumn("uuid")
  groupId!: string;
}
