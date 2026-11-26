import { Column, Entity, Index } from "typeorm";

import {
  Graph,
  GraphIncomingEdges,
  GraphLabel,
  GraphOutgoingEdges,
  PostgresqlUpdatableEntity,
} from "@codebase/persistence";

import type { GraphEdgeRow } from "@codebase/persistence";
import type { Relation } from "typeorm";

/**
 * One node of the `tags` graph: a label an event can carry, under any number of parents.
 *
 * `tag_edges` holds parent to child and `tag_trees` every ancestor; a tag with no parent is a root. The `is_*` flags only shape what menus offer, never what is valid.
 */
@Entity()
@Graph({ directed: true, edge: "TagEdge", nodes: () => Tag })
@Index("tags_slug", ["slug"])
export class Tag extends PostgresqlUpdatableEntity {
  /** The edges to the tags this one refines into. */
  @GraphOutgoingEdges("TagEdge")
  childEdges?: Relation<GraphEdgeRow<Tag>>[];

  /** The tag's lucide icon slug, such as `moon`. */
  @Column("text", { nullable: true })
  icon?: null | string;

  /** Whether the Filter menu offers the tag as a value. */
  @Column("boolean", { default: true })
  isFilterable!: boolean;

  /** Whether the Group menu offers the tag as a level. */
  @Column("boolean", { default: true })
  isGroupable!: boolean;

  /** Whether the Select menu offers the tag as a column. */
  @Column("boolean", { default: true })
  isSelectable!: boolean;

  /** Whether the Sort menu offers the tag. */
  @Column("boolean", { default: true })
  isSortable!: boolean;

  /** The tag's own label, unique among its siblings. */
  @Column("text")
  @GraphLabel()
  name!: string;

  /** What the tag means, in a sentence or so. */
  @Column("text", { nullable: true })
  note?: null | string;

  /** The edges from the tags this one refines. */
  @GraphIncomingEdges("TagEdge")
  parentEdges?: Relation<GraphEdgeRow<Tag>>[];

  /** Its place among siblings, lowest first. */
  @Column("smallint", { default: 0 })
  rank!: number;

  /** The machine-readable `name`, such as `aspect`; unique among siblings. */
  @Column("text")
  slug!: string;
}
