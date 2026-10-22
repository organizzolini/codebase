import {
  DURATION_BUCKETS,
  TAG_FIELD_PREFIX,
} from "../event-filters/event-filters.constants";

import { isDerivedGroupId } from "./event-group-fields";
import {
  DERIVED_GROUP_KEY_SQL,
  DERIVED_GROUP_SQL,
  TAG_GROUP_SQL,
} from "./event-groups.constants";

import type { SqlGroupSource } from "../events-database/events-database.types";
import type { EventGrouping, EventGroupLevel } from "./event-groups.types";

/**
 * A source that puts every event in no group at its level, for a field the
 * calendar does not know.
 */
const NO_GROUP_SOURCE: SqlGroupSource = {
  parameters: [],
  sql: `select null as "key", null as label, null as "path" where 0`,
};

/**
 * The duration bucket an event falls in, by the buckets' own values.
 */
const DURATION_BUCKET_SQL = `case ${DURATION_BUCKETS.map(
  (bucket) =>
    `when e.duration_minutes between ${String(bucket.minimum)} and ${String(bucket.maximum)} then '${bucket.value}'`,
).join(" ")} end`;

/**
 * Compiles a grouping to one parameterized source of group keys per level,
 * which `EventsDatabase.findEvents` reads into each event's `groups`. A tag
 * level answers every tag of that root at its depth the event carries, so
 * an event with two planets falls in both; a derived level answers one key.
 */
export function compileEventGrouping(
  grouping: EventGrouping,
): SqlGroupSource[] {
  return grouping.map((level) => compileGroupLevel(level));
}

/**
 * Compiles one level of a grouping.
 */
function compileGroupLevel(level: EventGroupLevel): SqlGroupSource {
  if (level.field.startsWith(TAG_FIELD_PREFIX)) {
    const depth = level.depth ?? 1;

    return {
      parameters: [level.field.slice(TAG_FIELD_PREFIX.length), depth, depth],
      sql: TAG_GROUP_SQL,
    };
  }

  if (!isDerivedGroupId(level.field)) {
    return NO_GROUP_SOURCE;
  }

  const key = DERIVED_GROUP_KEY_SQL[level.field].replace(
    "{duration}",
    DURATION_BUCKET_SQL,
  );

  return { parameters: [], sql: DERIVED_GROUP_SQL.replace("{key}", key) };
}
