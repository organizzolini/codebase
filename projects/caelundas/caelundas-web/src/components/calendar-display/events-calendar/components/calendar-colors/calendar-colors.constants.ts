import type { EventColorRule } from "./calendar-colors.types";

// ♟️ Constants

/**
 * Literal colors by kind; the most specific rule wins.
 */
export const EVENT_COLOR_RULES: readonly EventColorRule[] = [
  {
    color: "#f43f5e",
    label: "Major aspects",
    path: "Aspect / Simple / Major",
  },
  {
    color: "#f59e0b",
    label: "Minor aspects",
    path: "Aspect / Simple / Minor",
  },
  {
    color: "#8b5cf6",
    label: "Specialty aspects",
    path: "Aspect / Simple / Specialty",
  },
  {
    color: "#ec4899",
    label: "Aspect patterns",
    path: "Aspect / Compound",
  },
  { color: "#10b981", label: "Sign stays", path: "Ingress / Stay" },
  { color: "#f97316", label: "Directions", path: "Planetary / Direction" },
  {
    color: "#a8a29e",
    label: "Retrogrades",
    path: "Planetary / Direction / Retrograde Period",
  },
  {
    color: "#06b6d4",
    label: "Planetary phases",
    path: "Planetary / Phase",
  },
  { color: "#dc2626", label: "Eclipses", path: "Eclipse" },
  {
    color: "#eab308",
    label: "Daily solar cycle",
    path: "Daily / Solar",
  },
  {
    color: "#0ea5e9",
    label: "Daily lunar cycle",
    path: "Daily / Lunar",
  },
  {
    color: "#3b82f6",
    label: "Monthly lunar cycle",
    path: "Lunar / Monthly Cycle",
  },
  {
    color: "#84cc16",
    label: "Annual solar cycle",
    path: "Yearly",
  },
  {
    color: "#14b8a6",
    label: "Lunar apsides",
    path: "Lunar / Apsides",
  },
  { color: "#6366f1", label: "Twilight", path: "Daily / Twilight" },
];
