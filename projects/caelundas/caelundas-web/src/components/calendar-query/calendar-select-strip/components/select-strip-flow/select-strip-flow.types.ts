import type { ReactNode } from "react";

// 🏷️ Types

/** One chip of the strip: a stable key and its buttons. */
export interface SelectStripChip {
  content: ReactNode;
  id: string;
}
