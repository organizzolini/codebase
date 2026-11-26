import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { PostgresqlUpdatableEntity } from "@codebase/persistence";

import { Tag } from "../tags/tag.entity";

import { Group } from "./group.entity";

import type { Relation } from "typeorm";

/**
 * One row of `filters`: a group instantiated, pinning one value.
 *
 * A day filter pins a `period`. A tag filter pins a `tag_id` and sits beneath its parent tag's filter that day, or the day's, carrying the day's `period`. A fact is one measure at one filter.
 */
@Entity()
@Index("filters_key", ["groupId", "period", "tagId", "eventName", "slug"], {
  unique: true,
})
@Index("filters_parent_id", ["parentId"])
export class Filter extends PostgresqlUpdatableEntity {
  /** The event name it pins, for a group with the name dimension. */
  @Column("text", { nullable: true })
  eventName?: null | string;

  @JoinColumn({ name: "group_id" })
  @ManyToOne(() => Group, { onDelete: "RESTRICT" })
  group?: Relation<Group>;

  /** The group it instantiates. */
  @Column("uuid")
  groupId!: string;

  /** Its lucide icon slug, when it has one of its own. */
  @Column("text", { nullable: true })
  icon?: null | string;

  /** What it is called, when it needs a name. */
  @Column("text", { nullable: true })
  name?: null | string;

  /** What it selects, in a sentence, when that needs saying. */
  @Column("text", { nullable: true })
  note?: null | string;

  @JoinColumn({ name: "parent_id" })
  @ManyToOne(() => Filter, { nullable: true, onDelete: "CASCADE" })
  parent?: null | Relation<Filter>;

  /** The filter it narrows, or null for a scope. */
  @Column("uuid", { nullable: true })
  parentId?: null | string;

  /** The first date of the period it pins, or of its day. */
  @Column("date", { nullable: true })
  period?: null | string;

  /** Its key, when it needs one. */
  @Column("text", { nullable: true })
  slug?: null | string;

  @JoinColumn({ name: "tag_id" })
  @ManyToOne(() => Tag, { nullable: true, onDelete: "CASCADE" })
  tag?: null | Relation<Tag>;

  /** The tag it pins, for a group with the tag dimension. */
  @Column("uuid", { nullable: true })
  tagId?: null | string;
}
