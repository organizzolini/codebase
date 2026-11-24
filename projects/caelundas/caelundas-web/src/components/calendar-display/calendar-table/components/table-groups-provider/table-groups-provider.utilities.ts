import { toggleExpanded } from "../../calendar-table.utilities";

import type {
  TableGroupsAction,
  TableGroupsState,
  TableListStats,
} from "./table-groups-provider.types";

// 🔏 Private Functions

/**
 * Whether two lists hold the same ids in the same order.
 */
export function areSameIds(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index])
  );
}

/**
 * What can be done to the groups: close some while one is open, open some while one is closed; nothing when there are no groups.
 */
export function getCollapseActions(
  groupIds: readonly string[],
  expanded: ReadonlySet<string>,
): { canCollapse: boolean; canExpand: boolean } {
  let open = 0;

  for (const id of groupIds) {
    if (expanded.has(id)) {
      open += 1;
    }
  }

  return {
    canCollapse: open > 0,
    canExpand: open < groupIds.length,
  };
}

/**
 * The shared state after a change: a page size or a page count starts every list's own loading over, and a state that would not change is the same state, so nothing draws again.
 */
export function reduceTableGroups(
  state: TableGroupsState,
  action: TableGroupsAction,
): TableGroupsState {
  if (
    action.type === "collapse-all" ||
    action.type === "expand-all" ||
    action.type === "reset" ||
    action.type === "toggle"
  ) {
    return reduceGroupActions(state, action);
  }

  return reducePageActions(state, action);
}

/**
 * Whether two lists' sizes are the same.
 */
function areSameStats(left: TableListStats, right: TableListStats): boolean {
  return (
    left.longest === right.longest &&
    left.shown === right.shown &&
    left.total === right.total
  );
}

/**
 * Whether a set holds exactly the ids of a list.
 */
function hasSameMembers(
  members: ReadonlySet<string>,
  ids: readonly string[],
): boolean {
  return members.size === ids.length && ids.every((id) => members.has(id));
}

// 🌎 Public Functions

/**
 * The state after a change to which groups are open, or to which groups there are.
 */
function reduceGroupActions(
  state: TableGroupsState,
  action: Extract<
    TableGroupsAction,
    { type: "collapse-all" | "expand-all" | "reset" | "toggle" }
  >,
): TableGroupsState {
  if (action.type === "collapse-all") {
    return { ...state, expanded: new Set() };
  }

  if (action.type === "expand-all") {
    return { ...state, expanded: new Set(state.groupIds) };
  }

  if (action.type === "reset") {
    return resetTableGroups(state, action);
  }

  return { ...state, expanded: toggleExpanded(state.expanded, action.id) };
}

/**
 * The state after a change to the page size, the pages loaded, a list's own loading, or the lists' sizes.
 */
function reducePageActions(
  state: TableGroupsState,
  action: Extract<
    TableGroupsAction,
    { type: "more" | "set-limit" | "set-pages" | "set-stats" }
  >,
): TableGroupsState {
  if (action.type === "more") {
    return {
      ...state,
      limits: new Map([
        ...state.limits,
        [action.listId, action.shown + state.limit],
      ]),
    };
  }

  if (action.type === "set-limit") {
    return { ...state, limit: action.limit, limits: new Map(), pages: 1 };
  }

  if (action.type === "set-pages") {
    return { ...state, limits: new Map(), pages: Math.max(1, action.pages) };
  }

  return areSameStats(state.stats, action.stats)
    ? state
    : { ...state, stats: action.stats };
}

/**
 * The state after the table's data changed: every list starts over at the first page, and only the first path of groups is open.
 */
function resetTableGroups(
  state: TableGroupsState,
  data: Readonly<{ firstPath: readonly string[]; groupIds: readonly string[] }>,
): TableGroupsState {
  if (
    areSameIds(state.groupIds, data.groupIds) &&
    hasSameMembers(state.expanded, data.firstPath) &&
    state.limits.size === 0 &&
    state.pages === 1
  ) {
    return state;
  }

  return {
    ...state,
    expanded: new Set(data.firstPath),
    groupIds: data.groupIds,
    limits: new Map(),
    pages: 1,
  };
}
