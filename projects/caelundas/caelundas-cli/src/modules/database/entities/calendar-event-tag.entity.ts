import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { CalendarEvent } from "./calendar-event.entity";
import { Tag } from "./tag.entity";

import type { Relation } from "typeorm";

/**
 * One row of the `calendar_event_tags` join table: an event carrying a tag.
 *
 * The key is the pair, so an event carries a tag at most once, and both
 * sides cascade on delete. The primary key leads with the event, which
 * serves reading an event's tags, so a second index leads with the tag,
 * which serves finding the events that carry one.
 */
@Entity({ name: "calendar_event_tags" })
@Index("calendar_event_tags_tag_id_calendar_event_id", [
  "tagId",
  "calendarEventId",
])
export class CalendarEventTag {
  @JoinColumn({ name: "calendar_event_id" })
  @ManyToOne(() => CalendarEvent, { onDelete: "CASCADE" })
  calendarEvent?: Relation<CalendarEvent>;

  @PrimaryColumn("uuid", { comment: "The event that carries the tag" })
  calendarEventId!: string;

  @JoinColumn({ name: "tag_id" })
  @ManyToOne(() => Tag, { onDelete: "CASCADE" })
  tag?: Relation<Tag>;

  @PrimaryColumn("uuid", { comment: "The tag the event carries" })
  tagId!: string;
}
