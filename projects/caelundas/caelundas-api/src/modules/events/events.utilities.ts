/**
 * Converts a `Date` or string to ISO 8601 text, which Postgres reads as
 * `timestamptz`.
 */
export function toIsoString(instant: Date | string): string {
  return new Date(instant).toISOString();
}
