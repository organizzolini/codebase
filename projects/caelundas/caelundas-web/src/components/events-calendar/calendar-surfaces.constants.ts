// 🔖 Constants

/**
 * The surfaces of the calendar that stand over the night sky, as the
 * background each paints. The share of the color that is opaque is
 * `--surface-opacity`, which the Sky menu's calendar opacity sets on the
 * document: the lower it is, the more stars show through, and the harder the
 * text on it is to read. They are whole class names, so Tailwind finds them
 * in the source.
 */
export const SURFACE_CLASS_NAMES = {
  agendaDate: "bg-muted/(--surface-opacity)",
  agendaGroup: "bg-background/(--surface-opacity)",
  emptyCard: "bg-background/(--surface-opacity)",
  navigationTitle: "bg-background/(--surface-opacity)",
  timeGutter: "bg-background/(--surface-opacity)",
} as const;

/**
 * The same for the vendored calendars' surfaces, which live in the shared
 * presentation package and are changed from here: through the class hooks the
 * event calendar offers, and through selectors on the slots the Gantt
 * names, which need no edit to the package.
 */
export const VENDORED_SURFACE_CLASS_NAMES = {
  ganttHeaders:
    "[&_[data-slot=gantt-timeline-header]]:bg-background/(--surface-opacity) [&_[data-slot=gantt-tree-header]]:bg-background/(--surface-opacity)",
  ganttScrollbars:
    "[&_[data-slot=gantt-timeline-scrollbar-rail]]:bg-background/(--surface-opacity) [&_[data-slot=gantt-tree-scrollbar-rail]]:bg-background/(--surface-opacity) [&_[data-slot=scroll-area-scrollbar]]:bg-background/(--surface-opacity)",
  gridCells:
    "[&_[data-slot=event-calendar-all-day-cell]]:bg-background/(--surface-opacity) [&_[data-slot=event-calendar-day-column]]:bg-background/(--surface-opacity) [&_[data-slot=event-calendar-month-cell]]:bg-background/(--surface-opacity)",
  timeGridHeader: "bg-background/(--surface-opacity)",
} as const;
