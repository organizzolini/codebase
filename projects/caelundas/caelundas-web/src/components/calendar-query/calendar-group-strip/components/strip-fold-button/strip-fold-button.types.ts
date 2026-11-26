import type { FOLDABLE_STRIPS } from "./strip-fold-button.constants";

// 🏷️ Types

/** A strip that folds. */
export type FoldableStrip = (typeof FOLDABLE_STRIPS)[number];

/** Whether a strip is folded, and how to fold and unfold it. */
export interface StripFold {
  isFolded: boolean;
  onFold: () => void;
  onUnfold: () => void;
}
