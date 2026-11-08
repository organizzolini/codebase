/**
 * Writes an instant the GraphQL `DateTime` scalar parsed, or a string it left
 * as is, as the ISO 8601 text Postgres reads as a `timestamptz`.
 */
export function toIsoString(instant: Date | string): string {
  return new Date(instant).toISOString();
}
