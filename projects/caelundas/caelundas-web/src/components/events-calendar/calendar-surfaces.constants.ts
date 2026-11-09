// 🔖 Constants

/**
 * Surfaces over the night sky, as the background each paints; the number after the slash is its opaque share.
 */
export const SURFACE_CLASS_NAMES = {
  agendaDate: "bg-muted/35",
  agendaGroup: "bg-background/35",
  emptyCard: "bg-background/75",
  navigationTitle: "bg-background/50",
  timeGutter: "bg-background/35",
} as const;

/**
 * The same for the vendored calendars' surfaces, changed here through class hooks and Gantt slot selectors.
 */
export const VENDORED_SURFACE_CLASS_NAMES = {
  ganttHeaders:
    "[&_[data-slot=gantt-timeline-header]]:bg-background/35 [&_[data-slot=gantt-tree-header]]:bg-background/35",
  ganttScrollbars:
    "[&_[data-slot=gantt-timeline-scrollbar-rail]]:bg-background/35 [&_[data-slot=gantt-tree-scrollbar-rail]]:bg-background/35 [&_[data-slot=scroll-area-scrollbar]]:bg-background/35",
  timeGridHeader: "bg-background/35",
} as const;
