import type { LibraryFacetsQuery } from "../../../graphql/generated/operations";
import type { LIBRARY_FILTER_ICONS } from "./library-toolbar.constants";

// 🏷️ Types

/** The facet lists a filter field draws its options from. */
export type LibraryFacetKey = keyof Omit<LibraryFacetsResult, "__typename">;

/** The distinct values the library offers to filter on, with counts. */
export type LibraryFacetsResult = LibraryFacetsQuery["libraryFacets"];

/** A filter's key in the URL, one per Filter menu field. */
export type LibraryFilterKey = keyof typeof LIBRARY_FILTER_ICONS;
