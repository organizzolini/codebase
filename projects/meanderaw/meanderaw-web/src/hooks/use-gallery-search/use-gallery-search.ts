import { useNavigate, useSearch } from "@tanstack/react-router";

import {
  DEFAULT_GALLERY_VIEW,
  DEFAULT_PAGE_SIZE,
  DEFAULT_REPEATS,
} from "./use-gallery-search.constants";

import type { FilterLink } from "../../components/gallery/gallery-filters/components/filter-query/filter-query.types";
import type {
  SortEntry,
  UseGallerySearchResult,
  ViewState,
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
  const repeats = search.repeats ?? DEFAULT_REPEATS;
  const size = search.size ?? DEFAULT_PAGE_SIZE;

  // 💪 Handlers
  // The tree, the rows rule and the repeats change together, in one
  // navigation.
  const handleFilterChange = (link: FilterLink): void => {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        filter: link.filter,
        repeats: link.repeats,
        rows: link.rows,
      }),
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
  // Applies the parts a named view fixes, in one navigation.
  const handleViewApply = (state: Partial<ViewState>): void => {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        ...(state.view !== undefined && { view: state.view }),
        ...(state.link !== undefined && {
          filter: state.link.filter,
          repeats: state.link.repeats,
          rows: state.link.rows,
        }),
        ...(state.group !== undefined && {
          group: state.group.length === 0 ? undefined : [...state.group],
        }),
        ...(state.sorts !== undefined && { sort: [...state.sorts] }),
      }),
    });
  };
  const handleSizeChange = (next: number): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, size: next }),
    });
  };
  // No fields drops the parameter, which the default sort then stands for.
  const handleSortChange = (sorts: SortEntry[]): void => {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        sort: sorts.length === 0 ? undefined : sorts,
      }),
    });
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    group: search.group,
    handleFilterChange,
    handleGroupChange,
    handleSizeChange,
    handleSortChange,
    handleViewApply,
    repeats,
    size,
    sorts: search.sort ?? [],
    view,
  };
}
