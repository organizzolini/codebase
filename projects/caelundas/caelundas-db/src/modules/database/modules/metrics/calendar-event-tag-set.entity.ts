import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `calendar_event_tag_sets`: an event's tags as two sorted arrays, so a tag filter is one array test.
 *
 * `tag_ids` are the tags given directly and `ancestor_tag_ids` their proper ancestors. Every event has a row, with empty arrays when it carries no tag.
 */
@Index("calendar_event_tag_sets_calendar_event_id", ["calendarEventId"], {
  unique: true,
})
@Index("calendar_event_tag_sets_tag_ids", ["tagIds"], { type: "gin" })
@Index("calendar_event_tag_sets_ancestor_tag_ids", ["ancestorTagIds"], {
  type: "gin",
})
@ViewEntity({
  expression: `select
    e.id as calendar_event_id,
    coalesce(g.tag_ids, '{}'::uuid[]) as tag_ids,
    coalesce(a.ancestor_tag_ids, '{}'::uuid[]) as ancestor_tag_ids
from calendar_events as e
left join (
    select
        calendar_event_id,
        array_agg(tag_id order by tag_id) as tag_ids
    from calendar_event_tags
    group by calendar_event_id
) as g on e.id = g.calendar_event_id
left join (
    select
        et.calendar_event_id,
        array_agg(distinct c.ancestor_id order by c.ancestor_id) as ancestor_tag_ids
    from calendar_event_tags as et
    inner join tag_closures as c on et.tag_id = c.descendant_id and c.ancestor_id <> c.descendant_id
    group by et.calendar_event_id
) as a on e.id = a.calendar_event_id`,
  materialized: true,
  name: "calendar_event_tag_sets",
})
export class CalendarEventTagSet {
  /** Proper ancestors of the directly given tags, sorted; may overlap `tagIds`. */
  @ViewColumn()
  ancestorTagIds!: string[];

  /** The event. */
  @ViewColumn()
  calendarEventId!: string;

  /** Tags given directly, sorted. */
  @ViewColumn()
  tagIds!: string[];
}
