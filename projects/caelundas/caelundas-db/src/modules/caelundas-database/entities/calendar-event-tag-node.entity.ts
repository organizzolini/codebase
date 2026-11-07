import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import { createBigintTransformer } from "../caelundas-database.utilities";

/**
 * One row of the `calendar_event_tag_nodes` table: an event and a tag it
 * carries, either directly or through a descendant, so grouping or filtering
 * on a node also finds everything beneath it. The tag's depth, root, and path
 * are copied from {@link TagNode} so a reader needs no join.
 *
 * The table is derived: `CaelundasDatabaseService.refreshReadModel` rebuilds
 * it from the events' tags and the tag closure, so nothing else writes it.
 * The primary key leads with the event, which serves reading an event's tags;
 * `calendar_event_tag_nodes_event` serves grouping an event's tags by
 * dimension and depth, and `calendar_event_tag_nodes_tag` serves finding the
 * events under a tag.
 */
@Entity()
@Index("calendar_event_tag_nodes_event", [
  "calendarEventId",
  "tagRootId",
  "tagDepth",
])
@Index("calendar_event_tag_nodes_tag", ["tagId", "calendarEventId"])
export class CalendarEventTagNode {
  /** The event that carries the tag. */
  @PrimaryColumn("uuid")
  calendarEventId!: string;

  /** Whether the event was given this tag itself, rather than a descendant of it. */
  @Column("boolean")
  isDirect!: boolean;

  /** The number of ancestors the tag has, so a root is 0. */
  @Column({ transformer: createBigintTransformer(), type: "bigint" })
  tagDepth!: number;

  /** The tag the event carries, directly or through a descendant. */
  @PrimaryColumn("uuid")
  tagId!: string;

  /** The tag's own label. */
  @Column("text")
  tagName!: string;

  /** The tag's names from its root down, joined with ` / `. */
  @Column("text")
  tagPath!: string;

  /** The root of the tag's dimension. */
  @Column("uuid")
  tagRootId!: string;
}
