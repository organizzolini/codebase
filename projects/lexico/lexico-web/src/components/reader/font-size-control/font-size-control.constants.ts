import type { FontSize } from "./font-size-control.types";

// ♟️ Constants

/** Browser storage key holding the chosen font size. */
export const FONT_SIZE_KEY = "lexico-reader-font-size";

/** The font size a reader starts with. */
export const DEFAULT_FONT_SIZE: FontSize = "medium";

/** The sizes in order from smallest to largest. */
export const FONT_SIZES: readonly FontSize[] = ["small", "medium", "large"];

/** The class each font size applies to the text. */
export const FONT_SIZE_CLASSES: Readonly<Record<FontSize, string>> = {
  large: "text-2xl",
  medium: "text-lg",
  small: "text-base",
};
