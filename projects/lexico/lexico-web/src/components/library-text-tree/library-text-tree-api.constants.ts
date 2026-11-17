import { z } from "zod";

import { getLibraryInputSchema } from "../library-grid/library-grid-api.constants";

// ♟️ Constants

/** Children the tree asks for at a time. */
export const LIBRARY_CHILDREN_PAGE_SIZE = 100;

/** The most numbered buttons one range holds before a long run splits into ranges. */
export const LIBRARY_RANGE_SIZE = 20;

/** Works the tree asks for at a time, as many as a card holds. */
export const LIBRARY_WORKS_PAGE_SIZE = 50;

/** Validates what getLibraryChildren is called with. */
export const getLibraryChildrenInputSchema = z.object({
  page: z.number().int().positive(),
  parentTextId: z.string().min(1),
  search: z.string(),
});

/** Validates what getLibraryWorks is called with: the library's own page, for one author. */
export const getLibraryWorksInputSchema = getLibraryInputSchema.extend({
  authorId: z.string().min(1),
});
