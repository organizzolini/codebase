import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import { createBigintTransformer } from "../../database.utilities";

/**
 * One row of the `calendar_event_tag_nodes` table: an event and a tag it carries, directly or through a descendant. Derived by `DatabaseService.refreshReadModel`.
 */
@Entity()
@Index("calendar_event_tag_nodes_event", [
  "calendarEventId",
  "tagRootId",
  "tagDepth",
])
@Index("calendar_event_tag_nodes_tag", ["tagId", "calendarEventId"])
@Index("calendar_event_tag_nodes_path_event", ["tagPath", "calendarEventId"])
@Index("calendar_event_tag_nodes_root_tag", ["tagRootId", "tagId"])
@Index("calendar_event_tag_nodes_direct_tag", ["tagId", "calendarEventId"], {
  where: `"is_direct"`,
})
export class CalendarEventTagNode {
  /** The event that carries the tag. */
  @PrimaryColumn("uuid")
  calendarEventId!: string;

  /** Whether the event was tagged directly, not through a descendant. */
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
