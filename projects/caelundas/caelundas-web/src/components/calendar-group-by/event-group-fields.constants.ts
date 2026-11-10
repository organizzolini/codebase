/**
 * Tag roots a view groups by when the link names no grouping: agenda by type, timeline by type then planet.
 */
export const DEFAULT_GROUP_ROOTS = {
  agenda: ["Type"],
  timeline: ["Type", "Planet"],
} as const;
