import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import type { CascaderLabels } from "@codebase/presentation";

// ♟️ Constants

/**
 * The filter's words, under the cascader's key names.
 */
export const LABELS: Partial<CascaderLabels> = {
  back: DEFAULT_FILTER_LABELS.back,
  empty: DEFAULT_FILTER_LABELS.empty,
};

export const NOTHING = (): void => {};

/** Every row can be ticked; a branch's chevron opens it. */
export const PICK_EVERY_ROW = (): boolean => true;
