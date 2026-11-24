import { createContext } from "react";

import { PAGE_SIZE } from "../../calendar-table.constants";

import type {
  TableGroupsState,
  TableGroupsValue,
} from "./table-groups-provider.types";

// ♟️ Constants

/**
 * Nothing known of the table yet: no groups, none open, the first page of the default size, and no lists.
 */
export const INITIAL_TABLE_GROUPS: TableGroupsState = {
  expanded: new Set(),
  groupIds: [],
  limit: PAGE_SIZE,
  limits: new Map(),
  pages: 1,
  stats: { longest: 0, shown: 0, total: 0 },
};

/**
 * What the table shares when nothing provides it: no groups, and nothing to do.
 */
export const UNPROVIDED_TABLE_GROUPS: TableGroupsValue = {
  canCollapse: false,
  canExpand: false,
  collapseAll: () => {},
  dispatch: () => {},
  expandAll: () => {},
  provided: false,
  state: INITIAL_TABLE_GROUPS,
};

/**
 * Passes the table's state from the provider to the table and the toolbar's strips.
 */
export const TableGroupsContext = createContext<TableGroupsValue>(
  UNPROVIDED_TABLE_GROUPS,
);

/**
 * The page sizes the Page strip offers.
 */
export const PAGE_LIMITS: readonly number[] = [10, 25, 50, 100];
