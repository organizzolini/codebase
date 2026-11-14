import type {
  GroupCards,
  GroupLeaf,
} from "../../components/grouped-gallery/grouped-gallery.types";

// 🏷️ Types

/**
 * The cards read per group, and how to read more.
 */
export interface UseGroupCardsResult {
  /** What was read for each group, by the group's id. */
  cards: Readonly<Record<string, GroupCards>>;
  /** Reads a group's first or next page, or retries. */
  load: (leaf: GroupLeaf) => void;
}
