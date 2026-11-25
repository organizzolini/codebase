import { z } from "zod";

import { CAELUNDAS_PROJECT } from "@codebase/caelundas-db";
import { postgresEnvironmentSchema } from "@codebase/persistence";

/** Postgres bind-parameter limit; bulk inserts are split under it. */
export const POSTGRES_MAXIMUM_PARAMETERS = 65_535;

// 🌱 Add environment schema fields here
export const environmentSchema = z
  .object({
    ...postgresEnvironmentSchema({ project: CAELUNDAS_PROJECT }),
    END_DATE: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "END_DATE must be in YYYY-MM-DD format")
      .optional(),
    JOB_COMPLETION_INDEX: z.coerce.number().int().nonnegative().optional(),
    LATITUDE: z.coerce.number().min(-90).max(90).optional(),
    LONGITUDE: z.coerce.number().min(-180).max(180).optional(),
    OUTPUT_DIRECTORY: z.string().optional().default("./output"),
    START_DATE: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "START_DATE must be in YYYY-MM-DD format")
      .optional(),
    START_YEAR: z.coerce.number().int().min(1900).max(2100).optional(),
  })
  .refine(
    (environment) =>
      (environment.START_YEAR === undefined) ===
      (environment.JOB_COMPLETION_INDEX === undefined),
    {
      message: "START_YEAR and JOB_COMPLETION_INDEX must be set together",
      path: ["START_YEAR"],
    },
  );
