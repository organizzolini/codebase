import { z } from "zod";

import { CAELUNDAS_PROJECT } from "@codebase/caelundas-db";
import { postgresEnvironmentSchema } from "@codebase/persistence";

/**
 * The most bind parameters one Postgres statement accepts: the wire protocol
 * counts them in sixteen bits. A bulk insert is split into statements of
 * `floor(limit / columns)` rows so that none passes it.
 */
export const POSTGRES_MAXIMUM_PARAMETERS = 65_535;

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...postgresEnvironmentSchema({ project: CAELUNDAS_PROJECT }),
  END_DATE: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "END_DATE must be in YYYY-MM-DD format")
    .optional(),
  LATITUDE: z.coerce.number().min(-90).max(90).optional(),
  LONGITUDE: z.coerce.number().min(-180).max(180).optional(),
  OUTPUT_DIRECTORY: z.string().optional().default("./output"),
  START_DATE: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "START_DATE must be in YYYY-MM-DD format")
    .optional(),
});
