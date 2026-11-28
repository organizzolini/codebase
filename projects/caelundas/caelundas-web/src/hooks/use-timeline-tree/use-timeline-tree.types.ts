// 🏷️ Types

import type { TreePanelBase } from "../../components/calendar-display/calendar-timeline/components/timeline-tree-width/timeline-tree-width.types";
import type { CSSProperties } from "react";

/**
 * The tree panel fitted to the rows, and its pane's style.
 */
export interface UseTimelineTreeResult {
  /**
   * The Gantt's tree panel, its names column as wide as the widest row.
   */
  panel: TreePanelBase;
  /**
   * The style that holds the pane at its fitted width, yet within the window's share.
   */
  style: CSSProperties;
}
