import type { SectionState } from "../lexeme-section/lexeme-section.types";

// ♟️ Constants

/**
 * The state each click moves the translations to: the preview opens fully,
 * the full list closes, and a closed section returns to the preview.
 */
export const NEXT_STATE: Readonly<Record<SectionState, SectionState>> = {
  closed: "half",
  half: "open",
  open: "closed",
};

/** The class that clips the preview to two lines of text (`leading-5`). */
export const PREVIEW_CLASS = "max-h-10 overflow-hidden";
