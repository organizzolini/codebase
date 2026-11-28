// 🏷️ Types

import type { Dispatch } from "react";

/**
 * A group opened by clicking it, named for the Group strip.
 */
export interface PickedGroup {
  color: string | undefined;
  id: string;
  label: string;
}

/**
 * Every change to the shared state.
 */
export type TableGroupsAction =
  | {
      /**
       * The open groups to toggle on, when a layout shows fewer than the state holds.
       */
      base?: ReadonlySet<string> | undefined;
      id: string;
      /**
       * The group's name, kept while it is open, so the Group strip can list it.
       */
      picked?: PickedGroup | undefined;
      type: "toggle";
    }
  | {
      base?: ReadonlySet<string> | undefined;
      /**
       * The groups to open, the one picked last.
       */
      ids: readonly string[];
      picked: PickedGroup;
      type: "open";
    }
  | {
      base?: ReadonlySet<string> | undefined;
      levels: readonly number[];
      type: "collapse-all";
    }
  | {
      base?: ReadonlySet<string> | undefined;
      levels: readonly number[];
      type: "expand-all";
    }
  | {
      firstPath: readonly string[];
      groupIds: readonly string[];
      groupLevels: readonly number[];
      type: "register";
    }
  | {
      firstPath: readonly string[];
      groupIds: readonly string[];
      groupLevels: readonly number[];
      type: "reset";
    }
  | { limit: number; type: "set-limit" }
  | { listId: string; shown: number; type: "more" }
  | { pages: number; type: "set-pages" }
  | { stats: TableListStats; type: "set-stats" };

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
   * The level of each group id, in the ids' order.
   */
  groupLevels: readonly number[];
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
  /**
   * The groups opened by name, in the order they were, while they stay open.
   */
  picked: readonly PickedGroup[];
  /**
   * Every group any layout has registered since the data last changed, so a group seen once keeps its state across layouts.
   */
  seen: ReadonlySet<string>;
  stats: TableListStats;
  /**
   * Whether anyone has opened or closed a group since the data last changed; until then `expanded` is the lazy default.
   */
  touched: boolean;
}

/**
 * What the toolbar and table share, and how to change it.
 */
export interface TableGroupsValue {
  /**
   * Whether a group at the levels is open, so there is something to close.
   */
  canCollapse: (
    levels: readonly number[],
    base?: ReadonlySet<string>,
  ) => boolean;
  /**
   * Whether a group at the levels is closed, so there is something to open.
   */
  canExpand: (levels: readonly number[], base?: ReadonlySet<string>) => boolean;
  collapseAll: (levels: readonly number[], base?: ReadonlySet<string>) => void;
  dispatch: Dispatch<TableGroupsAction>;
  expandAll: (levels: readonly number[], base?: ReadonlySet<string>) => void;
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
