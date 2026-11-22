import type {
  GalleryMeander,
  MeandersPage,
} from "../../components/gallery/meander-gallery/meanders-api.types";
import type {
  MeanderFilterGroupInput,
  MeanderSortInput,
} from "../../graphql/generated/operations";

// 🏷️ Types

/**
 * The consecutive pages showing, from 1.
 */
export interface PageWindow {
  first: number;
  last: number;
}

/**
 * What the hook asks the API for, besides the offset.
 */
export interface PagingQuery {
  filter?: MeanderFilterGroupInput | undefined;
  repeats: number;
  size: number;
  sort?: readonly MeanderSortInput[] | undefined;
}

/**
 * The first page, pages read after it, window showing, and failure.
 */
export interface PagingState {
  /** Why the last read failed, and the window it was for. */
  failure?: undefined | { error: unknown; range: PageWindow };
  first: MeandersPage;
  /** The pages read after the first, by their number from 2. */
  pages: Readonly<Record<number, MeandersPage>>;
  range: PageWindow;
}

/**
 * The meanders of the pages showing, and how to move between pages.
 */
export interface UseMeandersResult {
  /** Adds the page after the window to it, keeping the scroll place. */
  append: () => void;
  /** Whether a page waits after the window, none under way or failed. */
  hasMore: boolean;
  /** Whether a page of the window is still being read. */
  isLoading: boolean;
  /** Why the last read failed, until the next try. */
  loadError: unknown;
  /** The meanders of the window's pages read so far, in order. */
  meanders: readonly GalleryMeander[];
  /** Shows the page after the window alone. */
  next: () => void;
  /** How many pages the meanders fill. */
  pageCount: number;
  /** Shows the page before the window alone. */
  previous: () => void;
  /** The consecutive pages showing. */
  range: PageWindow;
  /** Reads the pages the last failure wanted again. */
  retry: () => void;
  /** Shows one page alone, from 1, and scrolls to the top. */
  select: (page: number) => void;
}
