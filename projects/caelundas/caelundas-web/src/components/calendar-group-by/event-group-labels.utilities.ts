import { KEY_FORMATS_BY_FIELD } from "./event-group-labels.constants";

/**
 * Writes a derived group key the way a heading reads it, such as "Q1 2026",
 * "Week of March 1, 2026", "3 PM" or "Hours"; any other key as it is.
 */
export function formatDerivedKey(field: string, key: string): string {
  const format = KEY_FORMATS_BY_FIELD.get(field);

  return format === undefined ? key : format(key);
}
