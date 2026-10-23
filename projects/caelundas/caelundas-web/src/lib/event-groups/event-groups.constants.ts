import type { DerivedGroupId } from "./event-groups.types";

/**
 * The most levels a grouping nests: a group, a sub-group, and one more.
 */
export const MAXIMUM_GROUP_LEVELS = 3;

/**
 * The deepest a tag grouping may reach beneath its root.
 */
export const MAXIMUM_GROUP_DEPTH = 16;

/**
 * The ids of the fields derived from each event's start or duration.
 */
export const DERIVED_GROUP_IDS = {
  day: "day",
  duration: "duration",
  hour: "hour",
  month: "month",
  quarter: "quarter",
  week: "week",
  weekday: "weekday",
  year: "year",
} as const;

/**
 * The derived fields in the order the picker lists them: periods from the
 * longest down, then the duration.
 */
export const DERIVED_GROUP_ORDER: readonly DerivedGroupId[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "weekday",
  "hour",
  "duration",
];

/**
 * What the picker calls each derived field.
 */
export const DERIVED_GROUP_LABELS: Readonly<Record<DerivedGroupId, string>> = {
  day: "Day",
  duration: "Duration",
  hour: "Hour",
  month: "Month",
  quarter: "Quarter",
  week: "Week",
  weekday: "Weekday",
  year: "Year",
};

/**
 * The local day an event starts on, `YYYY-MM-DD`, which every time-based
 * group key is cut from.
 */
const LOCAL_DAY = `event_local_date(e."start", e.timezone)`;

/**
 * Each derived field's group key, one value per event, read in the event's
 * own zone. Keys sort in time order as text.
 */
export const DERIVED_GROUP_KEY_SQL: Readonly<Record<DerivedGroupId, string>> = {
  day: LOCAL_DAY,
  duration: "{duration}",
  hour: `printf('%02d', event_local_hour(e."start", e.timezone))`,
  month: `substr(${LOCAL_DAY}, 1, 7)`,
  quarter: `substr(${LOCAL_DAY}, 1, 4) || '-Q' || ((cast(substr(${LOCAL_DAY}, 6, 2) as integer) + 2) / 3)`,
  // The Sunday the week starts on, as the calendar draws weeks.
  week: `date(${LOCAL_DAY}, '-' || strftime('%w', ${LOCAL_DAY}) || ' days')`,
  weekday: `event_local_weekday(e."start", e.timezone)`,
  year: `substr(${LOCAL_DAY}, 1, 4)`,
};

/**
 * One derived group key for the event `e`, in place of `{key}`.
 */
export const DERIVED_GROUP_SQL = `select {key} as "key", null as label, null as "path"`;

/**
 * The tags an event falls under in one root at one depth, binding the root,
 * then the depth twice. A tag of the event's that ends above that depth
 * stands for itself: a leaf is its own group at any depth below it.
 */
export const TAG_GROUP_SQL = `
  select t.tag_id as "key", t.tag_name as label, t.tag_path as "path"
  from calendar_event_tag_nodes t
  where
    t.calendar_event_id = e.id
    and t.tag_root_id = ?
    and t.tag_depth > 0
    and (
      t.tag_depth = ?
      or (
        t.tag_depth < ?
        and not exists (
          select 1
          from calendar_event_tag_nodes x
          join tags_closure c on c.descendant_id = x.tag_id
          where
            x.calendar_event_id = e.id
            and c.ancestor_id = t.tag_id
            and x.tag_id != t.tag_id
        )
      )
    )
`;

/**
 * The picked tags an event falls under, with `{tags}` in place of one
 * placeholder for each. An event is attached to every tag above its own, so a
 * picked tag finds everything beneath it.
 */
export const PICKED_TAG_GROUP_SQL = `
  select t.tag_id as "key", t.tag_name as label, t.tag_path as "path"
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id and t.tag_id in ({tags})
`;
