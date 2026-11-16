import { z } from "zod";

// ♟️ Constants

/**
 * The API's default GraphQL URL, when the build variable is unset.
 */
export const DEFAULT_MEANDERAW_API_URL = "http://localhost:8367/graphql";

/**
 * Validates a GraphQL response envelope: data and errors.
 */
export const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

/**
 * Times a card's drawing repeats the tile, so the pattern shows.
 */
export const CARD_REPEATS = 6;

/**
 * How many meanders a page asks for.
 */
export const GALLERY_PAGE_SIZE = 48;
