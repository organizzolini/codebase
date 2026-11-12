import { KEY_FORMATS_BY_FIELD } from "./event-group-labels.constants";

/**
 * Writes a derived group key as a heading reads it, such as "Q1 2026" or "3 PM"; other keys as they are.
 */
export function formatDerivedKey(field: string, key: string): string {
  const format = KEY_FORMATS_BY_FIELD.get(field);

  return format === undefined ? key : format(key);
}
