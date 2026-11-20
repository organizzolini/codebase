import path from "node:path";

import { z } from "zod";

import { postgresEnvironmentSchema } from "@codebase/persistence";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...postgresEnvironmentSchema({ project: "caelundas" }),
  CAELUNDAS_API_CORS_ORIGINS: z
    .string()
    .default("")
    .transform((origins) =>
      origins
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  CAELUNDAS_API_LIGHTSHIP_PORT: z.coerce.number().default(9000),
  CAELUNDAS_API_PORT: z.coerce.number().default(3000),
});

/**
 * Code-first schema file, beside the root module so booting from the repository
 * root cannot write a stray `src/schema.gql` there.
 */
export const GRAPHQL_SCHEMA_FILE = path.join(import.meta.dirname, "schema.gql");
