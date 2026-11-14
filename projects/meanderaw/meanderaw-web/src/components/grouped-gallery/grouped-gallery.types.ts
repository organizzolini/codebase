import type { MeanderFilterGroupInput } from "../../graphql/generated/operations";
import type { GalleryMeander } from "../meander-gallery/meanders-api.types";

// 🏷️ Types

/**
 * The meanders of a last-level group, as far as read.
 */
export interface GroupCards {
  /** Where the next page starts, once one is read. */
  endCursor: null | string | undefined;
  /** Why the last read failed, until the next try. */
  error: unknown;
  /** Whether more wait after those read. */
  hasMore: boolean;
  meanders: readonly GalleryMeander[];
}

/**
 * A row of the flat list.
 */
export type GroupedItem =
  | { count: number; depth: number; key: string; kind: "header"; label: string }
  | { error: unknown; key: string; kind: "error"; leaf: GroupLeaf }
  | { key: string; kind: "cards"; meanders: readonly GalleryMeander[] }
  | { key: string; kind: "pending"; leaf: GroupLeaf };

/**
 * A last-level group and the filter that selects its cards.
 */
export interface GroupLeaf {
  filter: MeanderFilterGroupInput | undefined;
  id: string;
}
