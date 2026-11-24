// 🔖 Constants

/**
 * Whole Tailwind class names for surfaces over the sky.
 */
export const SURFACE_CLASS_NAMES = {
  emptyCard: "bg-background/(--surface-opacity)",
  navigationTitle: "bg-background dark:bg-input/30",
  timeGutter: "bg-background",
} as const;

/**
 * Vendored calendar surfaces, set through class hooks.
 */
export const VENDORED_SURFACE_CLASS_NAMES = {
  ganttHeaders:
    "[&_[data-slot=gantt-timeline-header]]:bg-background [&_[data-slot=gantt-tree-header]]:bg-transparent",
  ganttScrollbars:
    "[&_[data-slot=gantt-timeline-scrollbar-rail]]:bg-background [&_[data-slot=gantt-tree-scrollbar-rail]]:bg-transparent [&_[data-slot=scroll-area-scrollbar]]:bg-background",
  ganttTreePills:
    "[&_[data-slot=gantt-tree-header]_.truncate]:bg-background [&_[data-slot=gantt-tree-header]_.truncate]:border [&_[data-slot=gantt-tree-header]_.truncate]:rounded-md [&_[data-slot=gantt-tree-header]_.truncate]:px-2 [&_[data-slot=gantt-tree-header]_.truncate]:py-0.5 [&_[data-slot=gantt-tree-cell]_.truncate]:bg-background [&_[data-slot=gantt-tree-cell]_.truncate]:border [&_[data-slot=gantt-tree-cell]_.truncate]:rounded-md [&_[data-slot=gantt-tree-cell]_.truncate]:px-2 [&_[data-slot=gantt-tree-cell]_.truncate]:py-0.5 [&_[data-slot=gantt-tree-cell]_.truncate]:w-fit [&_[data-slot=gantt-tree-cell]_.truncate]:max-w-full [&_[data-slot=gantt-tree-cell]_.truncate:empty]:hidden [&_[data-slot=gantt-tree-header]_.truncate]:w-fit [&_[data-slot=gantt-tree-header]_.truncate]:max-w-full",
  gridCells:
    "[&_[data-slot=event-calendar-all-day-cell]]:bg-transparent [&_[data-slot=event-calendar-day-column]]:bg-transparent [&_[data-slot=event-calendar-month-cell]]:bg-transparent [&_[class~='bg-muted/25']]:bg-transparent [&_[class~='bg-muted/25']]:bg-none [&_[class~='bg-muted/40']]:bg-transparent [&_[class~='bg-primary/5']]:bg-transparent [&_[class~='bg-primary/3']]:bg-transparent",
  timeGridHeader: "bg-background",
} as const;

/** Buttons and event chips drawn solid over the sky. */
export const OPAQUE_CLASS_NAMES = {
  buttons:
    "dark:[&_[class*='bg-input/30']]:bg-[color-mix(in_oklab,hsl(var(--input))_30%,hsl(var(--background)))] dark:[&_[class*='bg-input/50']:hover]:bg-[color-mix(in_oklab,hsl(var(--input))_50%,hsl(var(--background)))]",
  events:
    "[&_[data-slot=event-calendar-event]]:bg-[color-mix(in_oklab,var(--ec-event-color)_15%,hsl(var(--background)))] [&_[data-slot=event-calendar-event]:hover]:bg-[color-mix(in_oklab,var(--ec-event-color)_25%,hsl(var(--background)))] [&_[data-slot=event-calendar-event][data-selected]]:bg-[color-mix(in_oklab,var(--ec-event-color)_30%,hsl(var(--background)))] dark:[&_[data-slot=event-calendar-event]]:bg-[color-mix(in_oklab,var(--ec-event-color)_20%,hsl(var(--background)))] dark:[&_[data-slot=event-calendar-event]:hover]:bg-[color-mix(in_oklab,var(--ec-event-color)_30%,hsl(var(--background)))]",
  ganttBars:
    "[&_[data-slot=gantt-bar]]:overflow-clip [&_[data-slot=gantt-bar]]:bg-[color-mix(in_oklab,var(--gantt-event-color)_20%,hsl(var(--background)))] [&_[data-slot=gantt-bar]:hover]:bg-[color-mix(in_oklab,var(--gantt-event-color)_30%,hsl(var(--background)))]",
  labels:
    "[&_[data-slot=event-calendar-time-grid]>div:first-child]:bg-background [&_[data-slot=event-calendar-all-day-section]]:bg-background [&_[data-slot=event-calendar-more]]:bg-muted [&_[data-slot=event-calendar-more]]:border [&_[data-slot=event-calendar-more]]:rounded-md [&_[data-slot=event-calendar-more]]:px-2 [&_[data-slot=event-calendar-more]]:text-foreground [&_[data-slot=event-calendar-more]]:w-fit [&_[data-slot=event-calendar-more]]:max-w-full [&_[data-slot=event-calendar-day-header]]:bg-background [&_[data-slot=event-calendar-time-gutter]]:bg-background [&_[data-slot=event-calendar-month-header]]:bg-background [&_[data-slot=event-calendar-month-day-number]]:bg-background [&_[data-slot=gantt-axis-group-label]]:bg-background",
} as const;
