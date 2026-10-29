import { z } from "zod";

import { sqliteEnvironmentSchema } from "@codebase/persistence";

import {
  DATABASE_DEFAULT_FILE,
  DATABASE_PROJECT,
} from "./modules/database/database.constants";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...sqliteEnvironmentSchema({ project: DATABASE_PROJECT }),
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
