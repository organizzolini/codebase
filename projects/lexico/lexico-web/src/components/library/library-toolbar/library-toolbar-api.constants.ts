import { createServerFn as createServerFunction } from "@tanstack/react-start";

import { fetchLibraryFacets } from "./library-toolbar-api.utilities";

import type { LibraryFacetsResult } from "./library-toolbar.types";

// ♟️ Constants

/**
 * Reads the provinces, inscription types, and materials the library offers.
 */
export const getLibraryFacets = createServerFunction({
  method: "GET",
}).handler(async (): Promise<LibraryFacetsResult> => fetchLibraryFacets());
