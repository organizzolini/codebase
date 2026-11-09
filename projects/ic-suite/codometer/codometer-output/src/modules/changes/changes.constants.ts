import { z } from "zod";

// ♟️ Constants

/**
 * Where a project's codometer run leaves its report.
 *
 * One glob per workspace directory, so `node_modules` strays are never read.
 */
export const REPORT_GLOBS = [
  "codometer-report.json",
  "applications/*/codometer-report.json",
  "packages/*/codometer-report.json",
  "packages/*/*/*/codometer-report.json",
  "projects/*/codometer-report.json",
  "projects/*/*/codometer-report.json",
  "projects/*/*/*/codometer-report.json",
  "tools/*/codometer-report.json",
];

/**
 * The shape of a codometer report, as far as this diff reads it.
 *
 * Validated, so a malformed report reads as nothing measured.
 */
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
