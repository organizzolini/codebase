// 🔖 Constants

/**
 * Calendar surfaces over the night sky, as whole class names for Tailwind; `--surface-opacity` sets the opaque share.
 */
export const SURFACE_CLASS_NAMES = {
  agendaDate: "bg-muted/(--surface-opacity)",
  agendaGroup: "bg-background/(--surface-opacity)",
  emptyCard: "bg-background/(--surface-opacity)",
  navigationTitle: "bg-background/(--surface-opacity)",
  timeGutter: "bg-background/(--surface-opacity)",
} as const;

/**
 * The same for the vendored calendars' surfaces, changed here through class hooks and Gantt slot selectors.
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
