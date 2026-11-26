import { z } from "zod";

// ♟️ Constants

/** How a measure's rows combine; each kind has its SQL in `modules/measures`. */
export const AGGREGATE_KINDS = [
  "clipped-sum",
  "clipped-union",
  "count-distinct",
  "distinct-names",
  "distinct-tags",
  "maximum",
  "minimum",
  "period",
  "progressive-max",
  "progressive-min",
  "progressive-percentile",
  "sum",
  "union",
] as const;

/** The operators of an expression node, by how many operands each takes. */
export const EXPRESSION_OPERATORS = {
  add: 2,
  coalesce: 2,
  divide: 2,
  greatest: 2,
  least: 2,
  multiply: 2,
  percent: 2,
  subtract: 2,
} as const;

/** Old metric slugs and what they resolve to now. */
export const METRIC_ALIASES: Readonly<Record<string, string>> = {
  instants: "perfective-events",
  "progressive-duration": "duration",
  spans: "progressive-events",
  "total-duration": "duration",
};

/** What a slug may be made of: lowercase words joined by hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/** The units a value is measured in. */
export const METRIC_UNITS = ["count", "duration", "instant", "none"] as const;

/** Every measure. */
export const MEASURES_SQL = `
  select m.id, m.slug, m."name", m.icon, m.note, m.unit
  from measures m
  order by m.slug collate "C"
`;

/** Every metric. */
export const METRICS_SQL = `
  select t.id, t.slug, t."name", t.icon, t.note, t.unit, t.expression_id
  from metrics t
  order by t.slug collate "C"
`;

/** One row of {@link MEASURES_SQL}. */
export const measureRowSchema = z.object({
  icon: z.string(),
  id: z.string(),
  name: z.string(),
  note: z.string(),
  slug: z.string(),
  unit: z.enum(METRIC_UNITS),
});

/** One row of {@link METRICS_SQL}. */
export const metricRowDataSchema = z.object({
  expression_id: z.string().nullable(),
  icon: z.string(),
  id: z.string(),
  name: z.string(),
  note: z.string(),
  slug: z.string(),
  unit: z.enum(METRIC_UNITS),
});
