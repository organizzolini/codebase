import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import type { CascaderLabels } from "@codebase/presentation";

// ♟️ Constants

/**
 * The cascader's words, those the filters use for their field picker.
 */
export const LABELS: Partial<CascaderLabels> = {
  back: DEFAULT_FILTER_LABELS.back,
  empty: DEFAULT_FILTER_LABELS.empty,
  panelLabel: DEFAULT_FILTER_LABELS.fieldsLabel,
  rootLevel: DEFAULT_FILTER_LABELS.fieldsLabel,
};

/**
 * The node value of a category, apart from every field key.
 */
export const CATEGORY_PREFIX = "category:";

/**
 * A handler that does nothing.
 */
export const NOTHING = (): void => {};
