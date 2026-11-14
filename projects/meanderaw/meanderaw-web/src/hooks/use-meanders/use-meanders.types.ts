import type { GalleryMeander } from "../../components/meander-gallery/meanders-api.types";

// 🏷️ Types

/**
 * The meanders read so far, and how to read the next page.
 */
export interface UseMeandersResult {
  /** Whether another page waits after the last one read. */
  hasMore: boolean;
  /** Why the last page read failed, until the next try. */
  loadError: unknown;
  /** Reads the next page, or tries again after it failed. */
  loadMore: () => void;
  meanders: readonly GalleryMeander[];
}
