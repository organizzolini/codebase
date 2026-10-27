import { DURATION_BUCKETS } from "./event-filters.constants";

import type { SqlGroupSource } from "../types/events-database.types";

/**
 * A source that puts every event in no group at its level, for a field the
 * calendar does not know.
 */
export const NO_GROUP_SOURCE: SqlGroupSource = {
  parameters: [],
  sql: `select null as "key", null as label, null as "path" where 0`,
};

/**
 * The duration bucket an event falls in, by the buckets' own values.
 */
export const DURATION_BUCKET_SQL = `case ${DURATION_BUCKETS.map(
  (bucket) =>
    `when e.duration_minutes between ${String(bucket.minimum)} and ${String(bucket.maximum)} then '${bucket.value}'`,
).join(" ")} end`;
