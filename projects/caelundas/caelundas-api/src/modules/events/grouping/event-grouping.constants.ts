import { z } from "zod";

import { DURATION_BUCKETS } from "../filters/event-filter-fields.constants";

import type { EventGroupLevel } from "./event-grouping.types";

// ♟️ Constants

/** Most levels a grouping nests, not counting the color level. */
export const MAXIMUM_GROUP_LEVELS = 3;

/**
 * The deepest a tag grouping may reach beneath its root.
 */
export const MAXIMUM_GROUP_DEPTH = 16;

/** Most tags one level may pick; keeps queries bounded. */
export const MAXIMUM_GROUP_TAGS = 256;

/** Longest allowed field id, after its tag prefix. */
export const MAXIMUM_GROUP_FIELD_LENGTH = 64;

/** Ids of start or duration fields, longest period first. */
export const CALENDAR_GROUP_IDS = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "weekday",
  "hour",
  "duration",
] as const;

/**
 * The duration bucket an event falls in, by the buckets' own values.
 */
const DURATION_BUCKET_SQL = `case ${DURATION_BUCKETS.map(
  (bucket) =>
    `when e.duration_minutes between ${String(bucket.minimum)} and ${String(bucket.maximum)} then '${bucket.value}'`,
).join(" ")} end`;

/** Derived fields' group keys, in the event's zone; Sunday is 0. */
export const CALENDAR_GROUP_KEY_SQL: Readonly<
  Record<(typeof CALENDAR_GROUP_IDS)[number], string>
> = {
  day: "e.start_local_day",
  duration: DURATION_BUCKET_SQL,
  hour: "right('0' || e.start_local_hour::text, 2)",
  month: "substr(e.start_local_day, 1, 7)",
  quarter: `substr(e.start_local_day, 1, 4) || '-Q' || ((substr(e.start_local_day, 6, 2)::integer + 2) / 3)::text`,
  // The Sunday the week starts on, as the calendar draws weeks.
  week: "(e.start_local_day::date - extract(dow from e.start_local_day::date)::integer)::text",
  weekday: `extract(dow from e."start" at time zone e.timezone)::integer::text`,
  year: "substr(e.start_local_day, 1, 4)",
};

/**
 * One derived group key for the event `e`, in place of `{key}`.
 */
export const CALENDAR_GROUP_SQL = `select {key} as "key", null::text as label, null::text as "path"`;

/** Puts every event in no group, for an unknown field. */
export const NO_GROUP_SQL = `select null::text as "key", null::text as label, null::text as "path" where false`;

/** Tags an event falls under at a depth; shallower leaves count. */
export const TAG_GROUP_SQL = `
  select t.tag_id::text as "key", t.tag_name as label, t.tag_path as "path"
  from calendar_event_tag_nodes t
  where
    t.calendar_event_id = e.id
    and t.tag_root_id::text = {root}
    and t.tag_depth > 0
    and (
      t.tag_depth = {depth}::bigint
      or (
        t.tag_depth < {depth}::bigint
        and not exists (
          select 1
          from calendar_event_tag_nodes x
          join tags_closure c on c.descendant_id = x.tag_id
          where
            x.calendar_event_id = e.id
            and c.ancestor_id = t.tag_id
            and x.tag_id <> t.tag_id
        )
      )
    )
`;

/** Picked tags an event falls under, including every ancestor tag. */
export const PICKED_TAG_GROUP_SQL = `
  select t.tag_id::text as "key", t.tag_name as label, t.tag_path as "path"
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id and t.tag_id = any({tags}::uuid[])
`;

/** Gathers a level's rows into JSON; unknown keys mean no group. */
export const GROUP_COLUMN_SQL = `,
    coalesce(
      (
        select json_agg(
          json_build_object('key', g."key", 'label', g.label, 'path', g."path")
          order by g."path" collate "C", g."key" collate "C"
        )
        from ({source}) g
        where g."key" is not null
      ),
      '[]'::json
    ) as {column}`;

/** Validates one grouping level from GraphQL, with optional nulls. */
export const eventGroupLevelSchema: z.ZodType<EventGroupLevel> = z.object({
  depth: z
    .number()
    .int()
    .min(1)
    .max(MAXIMUM_GROUP_DEPTH)
    .nullish()
    .transform((depth) => depth ?? undefined),
  field: z.string().max(MAXIMUM_GROUP_FIELD_LENGTH),
  tags: z
    .array(z.string())
    .max(MAXIMUM_GROUP_TAGS)
    .nullish()
    .transform((tags) => tags ?? []),
});

/** Validates a grouping from GraphQL, with at most the maximum levels. */
export const eventGroupingSchema = z.object({
  colorBy: eventGroupLevelSchema
    .nullish()
    .transform((level) => level ?? undefined),
  levels: eventGroupLevelSchema
    .array()
    .max(MAXIMUM_GROUP_LEVELS)
    .nullish()
    .transform((levels) => levels ?? []),
});
