import path from "node:path";

import { z } from "zod";

import { postgresEnvironmentSchema } from "@codebase/persistence";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...postgresEnvironmentSchema({ project: "meanderaw" }),
  MEANDERAW_API_CORS_ORIGINS: z
    .string()
    .default("*")
    .transform((origins) =>
      origins
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  MEANDERAW_API_LIGHTSHIP_PORT: z.coerce.number().default(9002),
  MEANDERAW_API_PORT: z.coerce.number().default(8367),
});

/** Schema file beside the root module, not the working directory. */
export const GRAPHQL_SCHEMA_FILE = path.join(import.meta.dirname, "schema.gql");
