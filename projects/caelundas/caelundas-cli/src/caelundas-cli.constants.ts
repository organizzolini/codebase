import path from "node:path";

import { z } from "zod";

import { CAELUNDAS_PROJECT } from "@codebase/caelundas-db";
import { sqliteEnvironmentSchema } from "@codebase/persistence";

/**
 * Where the database file is when `CAELUNDAS_SQLITE_DATABASE` names none:
 * `output/database.sqlite` in the `caelundas-cli` project, wherever the
 * command runs from, so the web build always finds what ingestion wrote.
 */
export const DATABASE_DEFAULT_FILE = path.resolve(
  import.meta.dirname,
  "../output/database.sqlite",
);

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...sqliteEnvironmentSchema({ project: CAELUNDAS_PROJECT }),
  // The default file is the project's own, not one beside the working directory.
  CAELUNDAS_SQLITE_DATABASE: z.string().min(1).default(DATABASE_DEFAULT_FILE),
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
