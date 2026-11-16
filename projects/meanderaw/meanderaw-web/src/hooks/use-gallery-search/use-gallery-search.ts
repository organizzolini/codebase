import { useNavigate, useSearch } from "@tanstack/react-router";

import {
  DEFAULT_GALLERY_VIEW,
  DEFAULT_SORT_DIRECTION,
} from "./use-gallery-search.constants";

import type {
  FilterGroup,
  RowsFilter,
} from "../../components/gallery-filter-builder/gallery-filter-builder.types";
import type {
  GalleryView,
  SortDirection,
  UseGallerySearchResult,
} from "./use-gallery-search.types";

// 🧩 Hook

/**
 * Reads the gallery's view, sort and filter from the link, and changes them by
 * replacing it.
 */
export function useGallerySearch(): UseGallerySearchResult {
  // 🪝 Hooks
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });

  // 🏗 Setup
  const view = search.view ?? DEFAULT_GALLERY_VIEW;
  const direction = search.direction ?? DEFAULT_SORT_DIRECTION;

  // 💪 Handlers
  // The tree and the rows rule change together, in one navigation.
  const handleFilterChange = (
    filter: FilterGroup | undefined,
    rows: RowsFilter,
  ): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, filter, rows }),
    });
  };
  // No levels drops the parameter, so a flat gallery has a clean link.
  const handleGroupChange = (group: string[]): void => {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        group: group.length === 0 ? undefined : group,
      }),
    });
  };
  const handleViewChange = (next: GalleryView): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, view: next }),
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
    group: search.group ?? [],
    handleFilterChange,
    handleGroupChange,
    handleSortChange,
    handleViewChange,
    sort: search.sort,
    view,
  };
}
