import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import type { CascaderLabels } from "@codebase/presentation";

/**
 * The filter's words, under the cascader's key names.
 */
export const LABELS: Partial<CascaderLabels> = {
  back: DEFAULT_FILTER_LABELS.back,
  empty: DEFAULT_FILTER_LABELS.empty,
  panelLabel: DEFAULT_FILTER_LABELS.fieldsLabel,
  rootLevel: DEFAULT_FILTER_LABELS.fieldsLabel,
  search: DEFAULT_FILTER_LABELS.searchFields,
};

export const NOTHING = (): void => {};
