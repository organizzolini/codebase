import type { EventColorRule } from "./calendar-colors.types";

// ♟️ Constants

/**
 * The colors by kind of event, as they are drawn on a dark or a light page.
 * Literal colors rather than theme variables: a stylesheet keeps only the
 * theme variables it uses, so a variable named here could be missing.
 *
 * A tag takes the most specific rule its path falls under, so a rule on a
 * tag beneath another's overrides the one above it.
 */
export const EVENT_COLOR_RULES: readonly EventColorRule[] = [
  {
    color: "#f43f5e",
    label: "Major aspects",
    path: "Type / Aspect / Simple Aspect / Major Aspect",
  },
  {
    color: "#f59e0b",
    label: "Minor aspects",
    path: "Type / Aspect / Simple Aspect / Minor Aspect",
  },
  {
    color: "#8b5cf6",
    label: "Specialty aspects",
    path: "Type / Aspect / Simple Aspect / Specialty Aspect",
  },
  {
    color: "#ec4899",
    label: "Aspect patterns",
    path: "Type / Aspect / Compound Aspect",
  },
  { color: "#10b981", label: "Ingresses", path: "Type / Ingress" },
  { color: "#f97316", label: "Directions", path: "Type / Direction" },
  {
    color: "#06b6d4",
    label: "Planetary phases",
    path: "Type / Planetary Phase",
  },
  { color: "#dc2626", label: "Eclipses", path: "Type / Eclipse" },
  {
    color: "#eab308",
    label: "Daily solar cycle",
    path: "Type / Cycle / Daily Solar Cycle",
  },
  {
    color: "#0ea5e9",
    label: "Daily lunar cycle",
    path: "Type / Cycle / Daily Lunar Cycle",
  },
  {
    color: "#3b82f6",
    label: "Monthly lunar cycle",
    path: "Type / Cycle / Monthly Lunar Cycle",
  },
  {
    color: "#84cc16",
    label: "Annual solar cycle",
    path: "Type / Cycle / Annual Solar Cycle",
  },
  {
    color: "#14b8a6",
    label: "Lunar apsides",
    path: "Type / Cycle / Lunar Apsides",
  },
  { color: "#6366f1", label: "Twilight", path: "Type / Twilight" },
];
