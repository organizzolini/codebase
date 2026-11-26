// ♟️ Constants

/** SQL for each derived field, in each event's own zone. */
export const CALENDAR_FIELD_SQL = {
  durationMinutes: "e.duration_minutes",
  endLocalDay: "e.end_local_day",
  hour: "e.start_local_hour",
  startLocalDay: "e.start_local_day",
  temporality: "e.temporality",
  weekday: "extract(dow from e.start_local_day::date)::integer",
} as const;

/** Tags in `{tags}` the event carries, ancestors included. */
export const EVENT_TAGS_MATCHING_SQL = `
  select c.ancestor_id as tag_id
  from calendar_event_tags et
  join tags_closure c on c.descendant_id = et.tag_id
  where et.calendar_event_id = e.id and c.ancestor_id = any({tags}::uuid[])
`;

/** Tags beneath `{root}` the event carries, whose number meets `{condition}`. */
export const EVENT_TAG_NUMBERS_SQL = `
  select 1
  from calendar_event_tags et
  join tags_closure c on c.descendant_id = et.tag_id
  join tag_info t on t.tag_id = c.ancestor_id
  where et.calendar_event_id = e.id
    and t.tag_root_id::text = {root}::text
    and {condition}
`;

/** A tag name's trailing number, such as 6 for Harmonic 6. */
export const TAG_NUMBER_SQL = `(case when t.tag_name ~ '[0-9]$' then replace(t.tag_name, rtrim(t.tag_name, '0123456789'), '')::numeric end)`;

/** How Postgres writes a bound number in SQL. */
export const PLACEHOLDER_PREFIX = "$";

/** Each tag's depth, root, path and rank: a statement's first CTEs. */
export const TAG_INFO_SQL = `tag_levels as materialized (
    select descendant_id as tag_id, count(*) as level
    from tags_closure
    group by descendant_id
  ),
  tag_info as materialized (
    select
      t.id as tag_id,
      t."name" as tag_name,
      own.level - 1 as tag_depth,
      (array_agg(a.id order by al.level))[1] as tag_root_id,
      string_agg(a."name", ' / ' order by al.level) as tag_path,
      string_agg(lpad(a.rank::text, 5, '0') || ':' || a."name", ' / ' order by al.level) as tag_rank
    from tags t
    join tag_levels own on own.tag_id = t.id
    join tags_closure c on c.descendant_id = t.id
    join tags a on a.id = c.ancestor_id
    join tag_levels al on al.tag_id = a.id
    group by t.id, t."name", own.level
  )`;

/** Paths of the boundary instants paired into Progressive events. */
export const PHASE_BOUNDARY_TAG_PATHS = [
  "Aspect / Phase / Forming",
  "Aspect / Phase / Dissolving",
] as const;

// It reads `tag_info`, so its statement starts with TAG_INFO_SQL, and it binds
// nothing, so Postgres computes it once.
/** The ids of the boundary tags and their descendants. */
export const PHASE_BOUNDARY_TAG_IDS_SQL = `(
    select coalesce(array_agg(pc.descendant_id), '{}'::uuid[])
    from tag_info p
    join tags_closure pc on pc.ancestor_id = p.tag_id
    where p.tag_path in (${PHASE_BOUNDARY_TAG_PATHS.map((path) => `'${path}'`).join(", ")})
  )`;

/** Path of the tag whose events last. */
export const PROGRESSIVE_TAG_PATH = "Temporality / Progressive";

// Like the boundary ids, it reads `tag_info` and binds nothing.
/** The ids of the Progressive tag and its descendants. */
export const PROGRESSIVE_TAG_IDS_SQL = `(
    select coalesce(array_agg(pc.descendant_id), '{}'::uuid[])
    from tag_info p
    join tags_closure pc on pc.ancestor_id = p.tag_id
    where p.tag_path = '${PROGRESSIVE_TAG_PATH}'
  )`;

/** True for an event `{event}` that carries no phase boundary tag. */
export const NOT_PHASE_BOUNDARY_SQL = `not exists (
    select 1
    from calendar_event_tags pet
    where pet.calendar_event_id = {event}
      and pet.tag_id = any(${PHASE_BOUNDARY_TAG_IDS_SQL}::uuid[])
  )`;

/** True for the facts event row `{alias}` with no boundary tag. */
export const NOT_PHASE_BOUNDARY_FACTS_SQL = `not ({alias}.tag_ids && ${PHASE_BOUNDARY_TAG_IDS_SQL})`;

// The stored local day and hour, its whole minutes and whether it is an
// instant, in place of a view. Postgres folds the subquery in.
/** The events with the local-time fields the API reads, days as text. */
export const EVENTS_LOCAL_SQL = `(
    select c.id, c."name", c.note, c."start", c."end", c.timezone,
      c.start_local_day::text as start_local_day,
      c.end_local_day::text as end_local_day,
      c.start_local_hour::integer as start_local_hour,
      floor(extract(epoch from c."end" - c."start") / 60)::integer as duration_minutes,
      case when c."start" = c."end" then 'Instant' else 'Duration' end as temporality
    from calendar_events c
  )`;
