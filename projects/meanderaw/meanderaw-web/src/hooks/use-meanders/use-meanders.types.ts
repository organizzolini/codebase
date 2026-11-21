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
 * What the hook asks the API for, besides the cursor.
 */
export interface PagingQuery {
  filter?: MeanderFilterGroupInput | undefined;
  repeats: number;
  size: number;
  sort?: MeanderSortInput | undefined;
}

/**
 * The first page, pages read after it, place showing, and failure.
 */
export interface PagingState {
  failure?: undefined | { error: unknown };
  first: MeandersPage | undefined;
  /** The pages read after the first, by their place from 1. */
  pages: Readonly<Record<number, MeandersPage>>;
  position: number;
}

/**
 * The page of meanders showing, and how to move between pages.
 */
export interface UseMeandersResult {
  /** Shows any page by its place from 0, reading it unless it was read already. */
  goTo: (position: number) => void;
  /** Whether the page asked for is still being read. */
  isLoading: boolean;
  /** Why the last read failed, until the next try. */
  loadError: unknown;
  /** The meanders of the page showing. */
  meanders: readonly GalleryMeander[];
  /** Shows the next page. */
  next: () => void;
  /** How many pages the meanders fill. */
  pageCount: number;
  /** The place of the page showing, from 0. */
  position: number;
  /** Shows the page before. */
  previous: () => void;
}
