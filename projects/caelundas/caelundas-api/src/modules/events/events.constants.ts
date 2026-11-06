import { z } from "zod";

// ♟️ Constants

/**
 * The span and zone of the whole dataset, or no row when it is empty. The
 * zone is the most common one, because the app shows one observer location.
 */
export const DATASET_SQL = `
  select
    count(*) as count,
    min(e."start") as "start",
    max(e."end") as "end",
    (
      select z.timezone
      from calendar_events z
      group by z.timezone
      order by count(*) desc, z.timezone collate "C"
      limit 1
    ) as timezone
  from calendar_events e
  having count(*) > 0
`;

/** One row of {@link DATASET_SQL}; Postgres answers a count as text. */
export const datasetRowSchema = z.object({
  count: z.coerce.number(),
  end: z.date(),
  start: z.date(),
  timezone: z.string(),
});
