// 🏷️ Types

import type { Dispatch } from "react";

/**
 * Every change to the shared state.
 */
export type TableGroupsAction =
  | {
      firstPath: readonly string[];
      groupIds: readonly string[];
      type: "reset";
    }
  | { id: string; type: "toggle" }
  | { limit: number; type: "set-limit" }
  | { listId: string; shown: number; type: "more" }
  | { pages: number; type: "set-pages" }
  | { stats: TableListStats; type: "set-stats" }
  | { type: "collapse-all" }
  | { type: "expand-all" };

/**
 * What the toolbar and table share: open groups, pages, list loading.
 */
export interface TableGroupsState {
  /**
   * The groups whose contents show; the rest show only their headers.
   */
  expanded: ReadonlySet<string>;
  groupIds: readonly string[];
  /**
   * How many events a page holds.
   */
  limit: number;
  /**
   * How far a list has been loaded by its own Show more row, by the list's id.
   */
  limits: ReadonlyMap<string, number>;
  /**
   * How many pages, from the first, every list shows.
   */
  pages: number;
  stats: TableListStats;
}

/**
 * What the toolbar and table share, and how to change it.
 */
export interface TableGroupsValue {
  /**
   * Whether some group is open, so there is something to close.
   */
  canCollapse: boolean;
  /**
   * Whether some group is closed, so there is something to open.
   */
  canExpand: boolean;
  collapseAll: () => void;
  dispatch: Dispatch<TableGroupsAction>;
  expandAll: () => void;
  /**
   * False when no provider holds the state, so the table keeps its own.
   */
  provided: boolean;
  state: TableGroupsState;
}

/**
 * How big the table's lists are and how much shows.
 */
export interface TableListStats {
  longest: number;
  shown: number;
  total: number;
}
