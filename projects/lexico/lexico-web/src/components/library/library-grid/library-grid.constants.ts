import { createServerFn as createServerFunction } from "@tanstack/react-start";

import { getLibraryInputSchema } from "./library-grid-api.constants";
import { fetchLibrary } from "./library-grid.utilities";

import type { LibraryPageResult } from "./library-grid.types";

// ♟️ Constants

/**
 * Reads one page of the library, narrowed by a search when one is given.
 */
export const getLibrary = createServerFunction({ method: "GET" })
  .validator(getLibraryInputSchema)
  .handler(async ({ data }): Promise<LibraryPageResult> => fetchLibrary(data));
