import type { LibraryFacetsQuery } from "../../graphql/generated/operations";

// 🏷️ Types

/** The facet lists a filter field draws its options from. */
export type LibraryFacetKey = keyof Omit<LibraryFacetsResult, "__typename">;

/** The distinct values the library offers to filter on, with counts. */
export type LibraryFacetsResult = LibraryFacetsQuery["libraryFacets"];
