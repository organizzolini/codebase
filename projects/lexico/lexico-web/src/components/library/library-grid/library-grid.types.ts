import type { LibraryQuery } from "../../../graphql/generated/operations";
import type {
  getLibraryInputSchema,
  librarySearchSchema,
} from "./library-grid-api.constants";
import type * as z from "zod/mini";

// 🏷️ Types

/** The library page the route asks the server function for. */
export type GetLibraryInput = z.infer<typeof getLibraryInputSchema>;

/** One Author card, with its top-level works and match ranges. */
export type LibraryAuthorRow = LibraryPageResult["authors"][number];

/** The filters the library URL may carry, apart from search, sort, limit, and page. */
export type LibraryFilterParameters = Omit<
  LibrarySearchParameters,
  "group" | "limit" | "page" | "search" | "sort"
>;

/** One match range the API reports for a field's value. */
export type LibraryMatchRow = LibraryAuthorRow["matches"][number];

/** One page of the library, as the API answers it. */
export type LibraryPageResult = LibraryQuery["library"];

/** What the library was asked for, apart from the page: search, filters, and sort. */
export type LibraryRequest = Omit<GetLibraryInput, "limit" | "page">;

/** The search parameters the library URL may carry. */
export type LibrarySearchParameters = z.infer<typeof librarySearchSchema>;

/**
 * A run of authors under one group heading, or none.
 */
export interface LibrarySection {
  heading: null | string;
  rows: LibraryAuthorRow[];
}

/** One Text in a card's hierarchy, with its child count and match ranges. */
export type LibraryTextRow = LibraryAuthorRow["works"][number];
