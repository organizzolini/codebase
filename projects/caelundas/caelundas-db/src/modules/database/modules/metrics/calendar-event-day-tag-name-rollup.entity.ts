import { Index, ViewColumn, ViewEntity } from "typeorm";

/**
 * One row of the materialized view `calendar_event_day_tag_name_rollups`: the events of one name that a tag node covers on one local day. Counting its distinct names over a window gives a tag's unique names from far fewer rows than events. Refreshed by `refreshMetrics`.
 */
@Index(
  "calendar_event_day_tag_name_rollups_day_tag_name",
  ["localDay", "tagId", "name"],
  { unique: true },
)
@Index("calendar_event_day_tag_name_rollups_tag_day_name", [
  "tagId",
  "localDay",
  "name",
])
@Index("calendar_event_day_tag_name_rollups_root_day_name", [
  "tagRootId",
  "localDay",
  "name",
])
@Index("calendar_event_day_tag_name_rollups_name_day", ["name", "localDay"])
@ViewEntity({
  expression: `select
    f.local_day,
    n.tag_id,
    f."name",
    n.tag_root_id,
    f.local_week,
    f.local_month,
    f.local_quarter,
    f.local_year,
    count(*) as events
from calendar_event_facts as f
inner join calendar_event_tag_nodes as n on f.calendar_event_id = n.calendar_event_id
group by f.local_day, n.tag_id, f."name", n.tag_root_id, f.local_week, f.local_month, f.local_quarter, f.local_year`,
  materialized: true,
  name: "calendar_event_day_tag_name_rollups",
})
export class CalendarEventDayTagNameRollup {
  /** Events of this name the tag covers that day. */
  @ViewColumn()
  events!: number;

  /** Local day of the events' start. */
  @ViewColumn()
  localDay!: string;

  /** First local day of the month. */
  @ViewColumn()
  localMonth!: string;

  /** First local day of the quarter. */
  @ViewColumn()
  localQuarter!: string;

  /** Monday of the local week. */
  @ViewColumn()
  localWeek!: string;

  /** Local year. */
  @ViewColumn()
  localYear!: number;

  /** The events' summary. */
  @ViewColumn()
  name!: string;

  /** The tag node this row covers. */
  @ViewColumn()
  tagId!: string;

  /** The root of the tag's dimension. */
  @ViewColumn()
  tagRootId!: string;
}
