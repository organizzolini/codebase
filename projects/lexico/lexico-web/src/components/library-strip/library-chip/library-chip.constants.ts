import { buttonVariants } from "@codebase/presentation";

// ♟️ Constants

/** The plain outline look of a joined segment that only reads, such as a chip's label or the page range, without the hover fill of a button. */
export const LIBRARY_TEXT_SEGMENT = buttonVariants({
  className: "pointer-events-none",
  variant: "outline",
});
