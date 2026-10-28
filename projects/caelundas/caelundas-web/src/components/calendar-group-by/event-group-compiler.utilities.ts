import { TAG_FIELD_PREFIX } from "../calendar-filters/event-filters.constants";

import {
  DURATION_BUCKET_SQL,
  NO_GROUP_SOURCE,
} from "./event-group-compiler.constants";
import { isDerivedGroupId } from "./event-group-fields.utilities";
import {
  DERIVED_GROUP_KEY_SQL,
  DERIVED_GROUP_SQL,
  PICKED_TAG_GROUP_SQL,
  TAG_GROUP_SQL,
} from "./event-groups.constants";

import type { SqlGroupSource } from "../events-calendar/events-database.types";
import type { EventGrouping, EventGroupLevel } from "./event-groups.types";

/**
 * Compiles a grouping to one parameterized source of group keys per level,
 * which `EventsDatabase.findEvents` reads into each event's `groups`. A tag
 * level answers the picked tags, or every tag of that root at its depth, the
 * event is under, so
 * an event with two planets falls in both; a derived level answers one key.
 */
export function compileEventGrouping(
  grouping: EventGrouping,
): SqlGroupSource[] {
  const sources: SqlGroupSource[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const level of grouping) {
    sources.push(compileGroupLevel(level));
  }

  return sources;
}

/**
 * Compiles one level of a grouping.
 */
function compileGroupLevel(level: EventGroupLevel): SqlGroupSource {
  if (level.field.startsWith(TAG_FIELD_PREFIX) && level.tags?.length) {
    return {
      parameters: [...level.tags],
      sql: PICKED_TAG_GROUP_SQL.replace(
        "{tags}",
        Array.from({ length: level.tags.length }, () => "?").join(", "),
      ),
    };
  }

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
