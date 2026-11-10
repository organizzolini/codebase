// ♟️ Constants

/**
 * The SQL each derived field reads, over the derived events view aliased
 * `e`. Days and hours are read in each event's own zone; a day is text
 * written `YYYY-MM-DD`, which orders like the date it names.
 */
export const CALENDAR_FIELD_SQL = {
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
 * The tag nodes of the event under test, beneath the root bound in place of
 * `{root}`, whose name ends in a number that meets `{condition}`.
 */
export const EVENT_TAG_NUMBERS_SQL = `
  select 1
  from calendar_event_tag_nodes t
  where t.calendar_event_id = e.id
    and t.tag_root_id::text = {root}::text
    and {condition}
`;

/**
 * The number a tag's name ends in, such as the 6 of "Harmonic 6": the name
 * with its non-digit prefix taken away. Only a name that ends in a digit is
 * numeric, so a root such as "Aspect Harmonic" itself never reads as 0.
 */
export const TAG_NUMBER_SQL = `(case when t.tag_name ~ '[0-9]$' then replace(t.tag_name, rtrim(t.tag_name, '0123456789'), '')::numeric end)`;

/**
 * What a bound value's number follows in the SQL, as Postgres writes it.
 */
export const PLACEHOLDER_PREFIX = "$";
