import { useNavigate, useSearch } from "@tanstack/react-router";

import { DEFAULT_GALLERY_VIEW } from "./use-gallery-search.constants";

import type {
  GalleryView,
  UseGallerySearchResult,
} from "./use-gallery-search.types";

// 🧩 Hook

/**
 * Reads the gallery's view from the link, and changes it by replacing the
 * link, so the back button does not step through every toggle.
 */
export function useGallerySearch(): UseGallerySearchResult {
  // 🪝 Hooks
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });

  // 🏗 Setup
  const view = search.view ?? DEFAULT_GALLERY_VIEW;

  // 💪 Handlers
  const handleViewChange = (next: GalleryView): void => {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, view: next }),
    });
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return { handleViewChange, view };
}
