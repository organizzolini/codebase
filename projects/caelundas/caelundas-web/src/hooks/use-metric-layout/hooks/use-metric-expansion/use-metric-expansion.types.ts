// 🏷️ Types

/**
 * The open groups, and how to open or close one.
 */
export interface UseMetricExpansionResult {
  /**
   * The ids of the groups open as the layout shows them.
   */
  expanded: ReadonlySet<string>;
  /**
   * Opens a group and the one above it, so its subgroups show in its place, and names it for the Group strip.
   */
  open: (parent: string, id: string, color?: string) => void;
  /**
   * Opens a closed group and closes an open one, by its id.
   */
  toggle: (id: string, color?: string) => void;
}
