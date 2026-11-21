// ♟️ Constants

/**
 * The title of the filter popup and the Filters button.
 */
export const FILTERS_TITLE = "Filter";

/**
 * What can take focus inside the popup.
 */
export const FOCUSABLE_SELECTOR =
  "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

/**
 * How the popup is placed and sized.
 */
export const POPUP_CLASS_NAME =
  "absolute top-full left-0 z-30 mt-2 flex w-[26rem] max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-md border border-(--line) bg-(--surface) p-3 shadow-lg";
