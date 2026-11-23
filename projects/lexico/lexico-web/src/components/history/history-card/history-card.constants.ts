import { BookOpenIcon, LanguagesIcon, SearchIcon } from "lucide-react";

import type { HistoryKindDisplay } from "./history-card.types";

// ♟️ Constants

/** How each kind of history entry is badged and drawn. */
export const KIND_DISPLAY: Readonly<
  Record<"lookup" | "search" | "text", HistoryKindDisplay>
> = {
  lookup: { icon: LanguagesIcon, label: "Word" },
  search: { icon: SearchIcon, label: "Search" },
  text: { icon: BookOpenIcon, label: "Text" },
};
