import { buttonVariants } from "@codebase/presentation";

// ♟️ Constants

/** Shows a chip's drag handle and cross on hover and on keyboard focus, and hides them otherwise. */
export const LIBRARY_CHIP_REVEAL =
  "pointer-events-auto opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-within/chip:opacity-100 focus-visible:opacity-100";

/** Fades a chip's icon out while its drag handle covers it. */
export const LIBRARY_CHIP_ICON_FADE =
  "transition-opacity group-hover/chip:opacity-0 group-focus-within/chip:opacity-0";

/** The plain outline look of a joined segment that only reads, such as a chip's label or the page range, without the hover fill of a button. */
export const LIBRARY_TEXT_SEGMENT = buttonVariants({
  className: "pointer-events-none",
  variant: "outline",
});

/** A chip's drag handle and cross: slim, the width of an icon. */
export const LIBRARY_CHIP_CONTROL = "w-4 px-0";
