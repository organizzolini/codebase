import { bindParameter } from "./event-filter-binder.utilities";
import { TAG_FIELD_PREFIX } from "./event-filter-fields.constants";
import { UUID_PATTERN } from "./event-filter-values.constants";
import {
  DERIVED_GROUP_IDS,
  DERIVED_GROUP_KEY_SQL,
  DERIVED_GROUP_SQL,
  GROUP_COLUMN_SQL,
  NO_GROUP_SQL,
  PICKED_TAG_GROUP_SQL,
  TAG_GROUP_SQL,
} from "./event-grouping.constants";

import type { EventFilterBinder } from "./event-filter.types";
import type {
  CompiledEventGrouping,
  EventGroupLevel,
} from "./event-grouping.types";

/**
 * Compiles grouping to one JSON-array column per level, placeholders numbered
 * after `offset`; an event can fall in several tag groups.
 */
export function compileEventGrouping(
  grouping: readonly EventGroupLevel[],
  offset: number,
): CompiledEventGrouping {
  const binder: EventFilterBinder = { offset, parameters: [] };
  let sql = "";

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const [index, level] of grouping.entries()) {
    sql += GROUP_COLUMN_SQL.replace("{source}", () =>
      compileGroupLevel(level, binder),
    ).replace("{column}", `group_${String(index)}`);
  }

  return { parameters: binder.parameters, sql };
}

/**
 * Compiles one level of a grouping to its source of keys.
 */
function compileGroupLevel(
  level: EventGroupLevel,
  binder: EventFilterBinder,
): string {
  if (level.field.startsWith(TAG_FIELD_PREFIX) && level.tags.length > 0) {
    // A pick that is no tag id matches nothing, as a tag the data lacks
    // would, rather than failing the cast.
    const known = level.tags.filter((tag) => UUID_PATTERN.test(tag));

    return PICKED_TAG_GROUP_SQL.replace("{tags}", () =>
      bindParameter(binder, known),
    );
  }

  if (level.field.startsWith(TAG_FIELD_PREFIX)) {
    const root = bindParameter(
      binder,
      level.field.slice(TAG_FIELD_PREFIX.length),
    );
    const depth = bindParameter(binder, level.depth ?? 1);

    return TAG_GROUP_SQL.replaceAll("{depth}", depth).replace("{root}", root);
  }

  const id = DERIVED_GROUP_IDS.find((candidate) => candidate === level.field);

  return id === undefined
    ? NO_GROUP_SQL
    : DERIVED_GROUP_SQL.replace("{key}", () => DERIVED_GROUP_KEY_SQL[id]);
}
