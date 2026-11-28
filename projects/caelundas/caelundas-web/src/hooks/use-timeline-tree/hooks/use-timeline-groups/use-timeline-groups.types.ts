// 🏷️ Types

import type { GanttResource } from "@codebase/presentation";
import type { ReactNode } from "react";

/**
 * The group rows the timeline lists, to register.
 */
export interface TimelineGroupList {
  /**
   * The ids of the first path down the rows, which start open.
   */
  firstPath: readonly string[];
  groupIds: readonly string[];
  /**
   * The level of each group id, in the ids' order.
   */
  groupLevels: readonly number[];
}

/**
 * The Gantt's closed groups, its change handler, and its row labels.
 */
export interface UseTimelineGroupsResult {
  /**
   * The ids of the group rows to draw closed.
   */
  collapsedGroups: string[];
  /**
   * Takes the closed ids the Gantt reports after a row is toggled.
   */
  onCollapsedGroupsChange: (ids: string[]) => void;
  /**
   * Draws a row's name, in its group's color and led by its own icon.
   */
  renderResourceLabel: (properties: {
    collapsed: boolean;
    isGroup: boolean;
    resource: GanttResource;
  }) => ReactNode;
}
