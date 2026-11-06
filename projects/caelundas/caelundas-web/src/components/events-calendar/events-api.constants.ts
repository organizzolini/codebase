import { z } from "zod";

// ♟️ Constants

/**
 * Where the Caelundas API serves GraphQL when `VITE_CAELUNDAS_API_URL` is not
 * set, the port its `CAELUNDAS_API_PORT` defaults to.
 */
export const DEFAULT_CAELUNDAS_API_URL = "http://localhost:6173/graphql";

/**
 * Validates the envelope of a GraphQL response: the data it answers with, and
 * the errors it reports instead of, or beside, it.
 */
export const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});
