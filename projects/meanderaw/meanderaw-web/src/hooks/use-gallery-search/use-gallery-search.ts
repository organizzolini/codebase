import { useNavigate, useSearch } from "@tanstack/react-router";

import {
  DEFAULT_GALLERY_VIEW,
  DEFAULT_REPEATS,
  DEFAULT_SORT_DIRECTION,
} from "./use-gallery-search.constants";

import type {
  GalleryView,
  SortDirection,
  UseGallerySearchResult,
} from "./use-gallery-search.types";

// 🧩 Hook

/**
 * Reads the gallery's view and sort from the link, and changes them by
 * replacing it.
 */
export function useGallerySearch(): UseGallerySearchResult {
  // 🪝 Hooks
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });

  // 🏗 Setup
  const view = search.view ?? DEFAULT_GALLERY_VIEW;
  const direction = search.direction ?? DEFAULT_SORT_DIRECTION;
  const repeats = search.repeats ?? DEFAULT_REPEATS;

  // 💪 Handlers
  const handleViewChange = (next: GalleryView): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, view: next }),
    });
  };
  const handleRepeatsChange = (next: number): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, repeats: next }),
    });
  };
  // Choosing no field drops both parameters: a direction means nothing alone.
  const handleSortChange = (
    sort: string | undefined,
    nextDirection: SortDirection,
  ): void => {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        direction: sort === undefined ? undefined : nextDirection,
        sort,
      }),
    });
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    direction,
    handleRepeatsChange,
    handleSortChange,
    handleViewChange,
    repeats,
    sort: search.sort,
    view,
  };
}
