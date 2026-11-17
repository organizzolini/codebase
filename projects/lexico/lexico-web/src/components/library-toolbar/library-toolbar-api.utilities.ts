import { LibraryFacetsDocument } from "../../graphql/generated/operations";
import { queryApi } from "../search-results/search.utilities";

import type { LibraryFacetsResult } from "./library-toolbar.types";

// 🌎 Public Functions

/**
 * Asks the API for the values each facet filter can pick from.
 */
export async function fetchLibraryFacets(): Promise<LibraryFacetsResult> {
  const { libraryFacets } = await queryApi(LibraryFacetsDocument, {});

  return libraryFacets;
}
