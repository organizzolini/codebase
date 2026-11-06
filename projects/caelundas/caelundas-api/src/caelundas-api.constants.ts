import path from "node:path";

import { z } from "zod";

import { postgresEnvironmentSchema } from "@codebase/persistence";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  ...postgresEnvironmentSchema({ project: "caelundas" }),
  CAELUNDAS_API_LIGHTSHIP_PORT: z.coerce.number().default(9001),
  CAELUNDAS_API_PORT: z.coerce.number().default(6173),
});

/**
 * Where GraphQLModule emits the code-first schema: beside the root module,
 * rather than under `process.cwd()`. Anything that boots the module from the
 * repository root, such as codependix exploring the container from the root
 * project's `codependix` target, otherwise wrote a stray `src/schema.gql` there.
 */
export const GRAPHQL_SCHEMA_FILE = path.join(import.meta.dirname, "schema.gql");
