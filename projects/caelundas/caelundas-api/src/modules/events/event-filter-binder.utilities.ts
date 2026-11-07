import { PLACEHOLDER_PREFIX } from "./event-filter-sql.constants";

import type { EventFilterBinder } from "./event-filter.types";

/**
 * Binds a value and answers the placeholder that stands for it, numbered
 * after the parameters the query already binds.
 */
export function bindParameter(
  binder: EventFilterBinder,
  value: unknown,
): string {
  binder.parameters.push(value);

  return `${PLACEHOLDER_PREFIX}${String(binder.offset + binder.parameters.length)}`;
}
