// SQLite knows no time zones, so the times an event happens at where it was
// observed are read through these functions, which every executor registers
// on its database under the names below before running a select.

/**
 * What a formatter writes: the `YYYY-MM-DD` day, or the hour from 00 to 23.
 */
export type LocalPart = "day" | "hour";

/**
 * A scalar SQL function of an ISO 8601 instant and an IANA zone. It answers
 * `null` for anything it cannot read, as SQLite's own date functions do.
 */
export type LocalTimeFunction = (
  instant: unknown,
  timeZone: unknown,
) => null | number | string;
