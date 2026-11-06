import moment from "moment-timezone";

import type { Moment } from "moment-timezone";
import type { ValueTransformer } from "typeorm";

// 🌎 Utilities

/**
 * Carries a `text` column as the `Moment` every detector and writer works in:
 * it writes the instant a moment, or a date inside a find operator, names as
 * ISO 8601 text in UTC, such as `2026-07-01T10:00:00.000Z`, and reads one back
 * in UTC, so a stored event renders exactly as the detected one did. Text in
 * that one format sorts and compares as the instants it names, which a
 * `datetime` column's space-separated text would not against the `T`-and-`Z`
 * text the web application's queries bind. A null or an undefined passes
 * through.
 */
export function createMomentTransformer(): ValueTransformer {
  return {
    from: (value?: null | string): Moment | null | undefined =>
      value === null || value === undefined ? value : moment.utc(value),
    to: (value?: Date | Moment | null): null | string | undefined =>
      value === null || value === undefined ? value : value.toISOString(),
  };
}
