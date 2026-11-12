// ♟️ Constants

/** SQL for each derived field, in each event's own zone. */
export const CALENDAR_FIELD_SQL = {
  durationMinutes: "e.duration_minutes",
  endLocalDay: `(e."end" at time zone e.timezone)::date::text`,
  hour: "e.start_local_hour",
  startLocalDay: "e.start_local_day",
  temporality: "e.temporality",
  weekday: `extract(dow from e."start" at time zone e.timezone)::integer`,
} as const;

/** Tag nodes of the event naming a `{tags}` tag. */
export const EVENT_TAGS_MATCHING_SQL = `
  select t.tag_id
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id and t.tag_id = any({tags}::uuid[])
`;

/** Tag nodes beneath `{root}` whose number meets `{condition}`. */
export const EVENT_TAG_NUMBERS_SQL = `
  select 1
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id
    and t.tag_root_id::text = {root}::text
    and {condition}
`;

/** A tag name's trailing number, such as 6 for Harmonic 6. */
export const TAG_NUMBER_SQL = `(case when t.tag_name ~ '[0-9]$' then replace(t.tag_name, rtrim(t.tag_name, '0123456789'), '')::numeric end)`;

/** How Postgres writes a bound number in SQL. */
export const PLACEHOLDER_PREFIX = "$";
