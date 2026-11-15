import { z } from "zod";

/** The page a library request gets when it names no page size. */
export const LIBRARY_DEFAULT_PAGE_SIZE = 24;

/** The most authors one library page may hold. */
export const LIBRARY_MAX_PAGE_SIZE = 100;

/**
 * The most Texts one author card carries. `textCount` still reports every
 * matching Text, so a card can say how many it leaves out.
 */
export const LIBRARY_TEXTS_PER_AUTHOR = 50;

/** The longest search string a library request may send. */
export const LIBRARY_MAX_SEARCH_LENGTH = 200;

/** Text columns a library search matches, besides the collection. */
export const LIBRARY_TEXT_SEARCH_COLUMNS = [
  "title",
  "edition",
  "editors",
  "province",
  "find_spot",
  "inscription_type",
  "material",
] as const;

/** Validates library arguments; absent page and page size take their defaults. */
export const libraryArgumentsSchema = z.object({
  page: z.number().int().min(1).nullish(),
  pageSize: z.number().int().min(1).max(LIBRARY_MAX_PAGE_SIZE).nullish(),
  search: z.string().max(LIBRARY_MAX_SEARCH_LENGTH).nullish(),
});
