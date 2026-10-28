/**
 * The tag roots, by name, a view groups by when the link names no grouping:
 * the agenda by type, the timeline by type and then planet.
 */
export const DEFAULT_GROUP_ROOTS = {
  agenda: ["Type"],
  timeline: ["Type", "Planet"],
} as const;
