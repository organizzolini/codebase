import type { ReactNode } from "react";

// 🏷️ Types

/** One chip: a key, its buttons, and its name. */
export interface SelectStripChip {
  content: ReactNode;
  id: string;
  name: string;
}
