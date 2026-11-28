import { MousePointer2 } from "lucide-react";

import type { LucideIcon } from "lucide-react";

// ♟️ Constants

export const TITLE = "Select";

/** The cursor icon leading the Select button on every layout. */
export const SelectIcon: LucideIcon = MousePointer2;

/** The Select menu lists selectable tags that have tags beneath. */
export const SELECT_MENU = { flag: "isSelectable", leaves: false } as const;

/**
 * The columns every event has, with what each shows.
 */
export const COLUMN_OPTIONS = [
  {
    description: "The event's name.",
    icon: "text",
    id: "name",
    label: "Name",
  },
  {
    description: "When the event starts.",
    icon: "calendar-arrow-down",
    id: "start",
    label: "Start",
  },
  {
    description: "When the event ends.",
    icon: "calendar-arrow-up",
    id: "end",
    label: "End",
  },
  {
    description: "How long the event lasts.",
    icon: "timer",
    id: "duration",
    label: "Duration",
  },
] as const;
