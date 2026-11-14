import type { FilterSurfaceKind } from "./gallery-filters.types";

// ♟️ Constants

/**
 * The title of the builder surface and the Filters button.
 */
export const FILTERS_TITLE = "Filter";

/**
 * The narrowest window a drawer opens in, below which a sheet does.
 */
export const TABLET_MINIMUM_WIDTH = 768;

/**
 * The narrowest window a popover opens in, below which a drawer does.
 */
export const DESKTOP_MINIMUM_WIDTH = 1024;

/**
 * What lies behind the surface: clear for a popover, dimmed otherwise.
 */
export const BACKDROP_CLASS_NAMES: Record<FilterSurfaceKind, string> = {
  drawer: "bg-black/50",
  popover: "bg-transparent",
  sheet: "bg-black/50",
};

/**
 * How each surface is placed and sized.
 */
export const SURFACE_CLASS_NAMES: Record<FilterSurfaceKind, string> = {
  drawer:
    "fixed inset-y-0 right-0 z-30 flex w-[36rem] max-w-full flex-col gap-3 overflow-y-auto border-l border-(--line) bg-(--surface) p-3",
  popover:
    "absolute top-full left-0 z-30 mt-2 flex max-h-[80dvh] w-[42rem] max-w-[95vw] flex-col gap-3 overflow-y-auto rounded-md border border-(--line) bg-(--surface) p-3 shadow-lg",
  sheet:
    "fixed inset-x-0 bottom-0 z-30 flex max-h-[85dvh] flex-col gap-3 overflow-y-auto rounded-t-xl border-t border-(--line) bg-(--surface) p-3",
};
