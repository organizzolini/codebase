import { useMemo } from "react";

import {
  measureTreePanel,
  toTreePaneStyle,
} from "../../components/calendar-display/calendar-timeline/components/timeline-tree-width/timeline-tree-width.utilities";

import type { TreePanelBase } from "../../components/calendar-display/calendar-timeline/components/timeline-tree-width/timeline-tree-width.types";
import type { UseTimelineTreeResult } from "./use-timeline-tree.types";
import type { GanttResource } from "@codebase/presentation";

// 🧩 Hook

/**
 * Fits the tree panel to the rows showing, so it widens and narrows as groups open and close.
 */
export function useTimelineTree(
  resources: readonly GanttResource[],
  collapsed: readonly string[],
  base: Readonly<TreePanelBase>,
): UseTimelineTreeResult {
  // 🪝 Hooks
  const panel = useMemo(
    () => measureTreePanel(resources, collapsed, base),
    [base, collapsed, resources],
  );

  // 🏗 Setup
  const style = useMemo(() => toTreePaneStyle(panel.width), [panel.width]);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return { panel, style };
}
