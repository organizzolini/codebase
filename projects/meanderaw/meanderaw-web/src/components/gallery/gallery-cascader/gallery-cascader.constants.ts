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
 * The category whose characteristics are nested by sub-category.
 */
export const NESTED_CATEGORY = "submatrix";

/**
 * How many characteristics the category holds before it nests.
 */
export const NESTING_THRESHOLD = 48;

/**
 * The branch that holds every script's letters.
 */
export const LETTER_BRANCH = "Letter";

/**
 * Reads a lettered name: letter, compass word, script.
 */
export const LETTER_NAME =
  /^(.+?) (?:Northeast|Northwest|Southeast|Southwest)(?: (?:Half|Quarter|Three Quarter))? (\S+) Count$/u;

/**
 * The words a name ends with that say how it is measured.
 */
export const MEASURE_SUFFIX = /\s+(?:Count|Length)$/u;

/**
 * A handler that does nothing.
 */
export const NOTHING = (): void => {};

/**
 * Wraps each description, a truncated small span, to two lines.
 */
export const DESCRIPTION_CLASS =
  "[&_span.truncate.text-xs]:line-clamp-2 [&_span.truncate.text-xs]:break-words [&_span.truncate.text-xs]:whitespace-normal";

/**
 * Bounds a picker's width, and wraps its descriptions.
 */
export const PICKER_CLASS = `w-80 min-w-64 max-w-[min(28rem,90vw)] ${DESCRIPTION_CLASS}`;

/**
 * The picker class for a surface's content, without padding or gap.
 */
export const SURFACE_PICKER_CLASS = `${PICKER_CLASS} gap-0 p-0`;
