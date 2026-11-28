import { z } from "zod";

// ♟️ Constants

/** Most subgroups one group returns, in order. */
export const MAXIMUM_METRIC_GROUPS = 500;

/** Prefix of the column one metric is selected into. */
export const METRIC_COLUMN_PREFIX = "m";

/** One row of the metrics query; the metric columns are read apart. */
export const metricRowSchema = z.looseObject({
  id: z.string().default(""),
  key: z.string().nullish().default(null),
  label: z.string().nullish().default(null),
  parent_id: z.string().default(""),
  path: z.string().nullish().default(null),
  period: z.coerce.number(),
  rank: z.string().nullish().default(null),
});

/** A metric's value in a row: a number, or null for none. */
export const metricValueSchema = z.number().nullable();

/** The tag names a "No …" group is called after. */
export const TAG_NAMES_SQL = `select t.id::text as id, t."name" from tags t where t.id::text = any($1::text[])`;

/** One row of {@link TAG_NAMES_SQL}. */
export const tagNameRowSchema = z.object({ id: z.string(), name: z.string() });
