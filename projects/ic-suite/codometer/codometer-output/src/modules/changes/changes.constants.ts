import { z } from "zod";

// ♟️ Constants

/** The report file names: the measurement's default, and `codometer-weigh`'s. */
const REPORT_NAMES = ["codometer-report.json", "codometer-weigh-report.json"];

/** Where a project's report may sit, relative to the working directory. */
const REPORT_DIRECTORIES = [
  "",
  "applications/*/",
  "packages/*/",
  "packages/*/*/*/",
  "projects/*/",
  "projects/*/*/",
  "projects/*/*/*/",
  "tools/*/",
];

/** Glob for a project's codometer report, skipping `node_modules`. */
export const REPORT_GLOBS = REPORT_DIRECTORIES.flatMap((directory) =>
  REPORT_NAMES.map((name) => `${directory}${name}`),
);

/** Report shape this diff reads; malformed reports count as nothing. */
export const codometerReportSchema = z.object({
  failures: z
    .array(
      z.object({
        kind: z.enum(["limit", "target"]),
        reason: z.string(),
        subject: z.string(),
      }),
    )
    .optional(),
  targets: z.array(
    z.object({
      empty: z.boolean(),
      metrics: z.array(
        z.object({
          limits: z.array(
            z.object({
              breached: z.boolean(),
              label: z.string().nullable(),
              severity: z.enum(["fail", "warn"]),
              value: z.number(),
            }),
          ),
          name: z.string(),
          unit: z.enum(["bytes"]).nullable(),
          value: z.number(),
        }),
      ),
      name: z.string(),
    }),
  ),
});
