import { createContext } from "react";

// ♟️ Constants

/** The strips that fold, in the order the link lists them. */
export const FOLDABLE_STRIPS = ["select", "group", "sort", "filter"] as const;

/** What a chip's Fold item does; none where the strip cannot fold. */
export const StripFoldContext = createContext<(() => void) | undefined>(
  undefined,
);
