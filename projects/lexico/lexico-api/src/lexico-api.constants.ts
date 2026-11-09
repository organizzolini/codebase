import path from "node:path";

import { z } from "zod";

import { postgresEnvironmentSchema } from "@codebase/persistence";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...postgresEnvironmentSchema({ project: "lexico" }),
  LEXICO_API_CORS_ORIGINS: z
    .string()
    .default("http://localhost:7797")
    .describe("Comma-separated origins allowed to call the API from a browser")
    .transform((origins) =>
      origins
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  LEXICO_API_LIGHTSHIP_PORT: z.coerce.number().default(9000),
  LEXICO_API_PORT: z.coerce.number().default(5003),
});

/**
 * Code-first schema file, beside the root module so booting from the repository
 * root cannot write a stray `src/schema.gql` there.
 */
export const GRAPHQL_SCHEMA_FILE = path.join(import.meta.dirname, "schema.gql");
