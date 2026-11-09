// ♟️ Constants

/**
 * SQL for each derived field, over the events view aliased `e`, in each event's own zone.
 */
export const DERIVED_FIELD_SQL = {
  durationMinutes: "e.duration_minutes",
  endLocalDay: `(e."end" at time zone e.timezone)::date::text`,
  hour: "e.start_local_hour",
  startLocalDay: "e.start_local_day",
  temporality: "e.temporality",
  weekday: `extract(dow from e."start" at time zone e.timezone)::integer`,
} as const;

/**
 * The tag nodes of the event under test that name one of the tags bound in
 * place of `{tags}`.
 */
export const EVENT_TAGS_MATCHING_SQL = `
  select t.tag_id
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id and t.tag_id = any({tags}::uuid[])
`;

/**
 * Tag nodes of the event under test beneath `{root}` whose name ends in a number meeting `{condition}`.
 */
export const EVENT_TAG_NUMBERS_SQL = `
  select 1
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id
    and t.tag_root_id::text = {root}::text
    and {condition}
`;

/**
 * The number a tag's name ends in, such as 6 for "Harmonic 6"; "Aspect Harmonic" is not numeric.
 */
export const TAG_NUMBER_SQL = `(case when t.tag_name ~ '[0-9]$' then replace(t.tag_name, rtrim(t.tag_name, '0123456789'), '')::numeric end)`;

/**
 * What a bound value's number follows in the SQL, as Postgres writes it.
 */
export const PLACEHOLDER_PREFIX = "$";
