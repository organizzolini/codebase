import { ChevronDown, ChevronsDown, ChevronUp } from "lucide-react";

// ♟️ Constants

/** The caret for each state: down to open, double down for the preview, up to close. */
export const CARETS = {
  closed: ChevronDown,
  half: ChevronsDown,
  open: ChevronUp,
} as const;
