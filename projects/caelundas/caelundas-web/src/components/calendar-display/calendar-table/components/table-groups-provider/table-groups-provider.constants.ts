import { createContext } from "react";

import { PAGE_SIZE } from "../../calendar-table.constants";

import type {
  TableGroupsState,
  TableGroupsValue,
} from "./table-groups-provider.types";

// ♟️ Constants

/**
 * Nothing known yet: no groups, none open, first page.
 */
export const INITIAL_TABLE_GROUPS: TableGroupsState = {
  expanded: new Set(),
  groupIds: [],
  groupLevels: [],
  limit: PAGE_SIZE,
  limits: new Map(),
  pages: 1,
  picked: [],
  seen: new Set(),
  stats: { longest: 0, shown: 0, total: 0 },
  touched: false,
};

/**
 * What the table shares when nothing provides it.
 */
export const UNPROVIDED_TABLE_GROUPS: TableGroupsValue = {
  canCollapse: () => false,
  canExpand: () => false,
  collapseAll: () => {},
  dispatch: () => {},
  expandAll: () => {},
  provided: false,
  state: INITIAL_TABLE_GROUPS,
};

/**
 * Passes the table's state to the table and strips.
 */
export const TableGroupsContext = createContext<TableGroupsValue>(
  UNPROVIDED_TABLE_GROUPS,
);

/**
 * The page sizes the Page strip offers.
 */
export const PAGE_LIMITS: readonly number[] = [100, 250, 500, 1000];
