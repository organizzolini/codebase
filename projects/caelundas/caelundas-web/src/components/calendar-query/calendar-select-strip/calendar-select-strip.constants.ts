// ♟️ Constants

export const TITLE = "Select";

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
] as const;
