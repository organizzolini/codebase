import path from "node:path";

import { z } from "zod";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  {{nameConstantCase}}_LIGHTSHIP_PORT: z.coerce.number().default(9000),
  {{nameConstantCase}}_PORT: z.coerce.number().default(3000),
});

/**
 * Code-first schema file, beside the root module so booting from the repository
 * root cannot write a stray `src/schema.gql` there.
 */
export const GRAPHQL_SCHEMA_FILE = path.join(import.meta.dirname, "schema.gql");
