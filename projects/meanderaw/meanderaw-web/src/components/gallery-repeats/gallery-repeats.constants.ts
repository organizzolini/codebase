import {
  MAXIMUM_REPEATS,
  MINIMUM_REPEATS,
} from "../../hooks/use-gallery-search/use-gallery-search.constants";

// ♟️ Constants

/**
 * The repeat counts the control offers, from the fewest to the most.
 */
export const REPEAT_OPTIONS = Array.from(
  { length: MAXIMUM_REPEATS - MINIMUM_REPEATS + 1 },
  (_, offset) => MINIMUM_REPEATS + offset,
);
