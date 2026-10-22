import type { CalendarEventRecord } from "../events-database/events-database.types";

// 🔖 Type

/**
 * One kind of event and the color it is drawn in: a tag's path from its
 * root, which also colors every tag beneath it.
 */
export interface EventColorRule {
  color: string;
  label: string;
  path: string;
}

// 🔖 Constants

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
  { color: "#f97316", label: "Stations", path: "Type / Station" },
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

// 🧩 Functions

/**
 * Draws every event in the color of its kind, or in none: with colors off an
 * event keeps no color, so the views draw it in their default.
 */
export function colorEvents(
  events: readonly CalendarEventRecord[],
  enabled: boolean,
): CalendarEventRecord[] {
  const colored: CalendarEventRecord[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const event of events) {
    colored.push({ ...event, color: enabled ? getEventColor(event) : null });
  }

  return colored;
}

/**
 * The color of an event's kind: that of its kind's rule, or its own color
 * from the data when it has none.
 */
export function getEventColor(event: CalendarEventRecord): null | string {
  return getEventKind(event)?.color ?? event.color;
}

/**
 * The kind of an event: the most specific rule any of its tags falls under,
 * or none when no rule does.
 */
export function getEventKind(
  event: CalendarEventRecord,
): EventColorRule | null {
  let kind: EventColorRule | null = null;

  for (const tag of event.tags) {
    for (const rule of EVENT_COLOR_RULES) {
      if (
        rule.path.length > (kind?.path.length ?? -1) &&
        (tag.path === rule.path || tag.path.startsWith(`${rule.path} / `))
      ) {
        kind = rule;
      }
    }
  }

  return kind;
}
