import { toggleExpanded } from "../../calendar-table.utilities";

import type {
  PickedGroup,
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
 * What can be done to the groups at some levels: close some while one is open, open some while one is closed.
 */
export function getCollapseActions(
  state: Pick<TableGroupsState, "expanded" | "groupIds" | "groupLevels">,
  levels: readonly number[],
): { canCollapse: boolean; canExpand: boolean } {
  let open = 0;
  let total = 0;

  for (const [index, id] of state.groupIds.entries()) {
    if (levels.includes(state.groupLevels[index] ?? -1)) {
      total += 1;
      open += state.expanded.has(id) ? 1 : 0;
    }
  }

  return { canCollapse: open > 0, canExpand: open < total };
}

/**
 * The shared state after a change, the same state when nothing changes, so nothing draws again.
 */
export function reduceTableGroups(
  state: TableGroupsState,
  action: TableGroupsAction,
): TableGroupsState {
  if (
    action.type === "collapse-all" ||
    action.type === "expand-all" ||
    action.type === "open" ||
    action.type === "register" ||
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
 * The groups opened by name that are still open, with one more when it is open.
 */
function keepPickedGroups(
  state: Pick<TableGroupsState, "picked">,
  expanded: ReadonlySet<string>,
  added?: PickedGroup,
): readonly PickedGroup[] {
  const kept = state.picked.filter(
    (group) => expanded.has(group.id) && group.id !== added?.id,
  );

  return added !== undefined && expanded.has(added.id)
    ? [...kept, added]
    : kept;
}

/**
 * The state after a change to which groups are open, or to which groups there are.
 */
function reduceGroupActions(
  state: TableGroupsState,
  action: Extract<
    TableGroupsAction,
    {
      type:
        | "collapse-all"
        | "expand-all"
        | "open"
        | "register"
        | "reset"
        | "toggle";
    }
  >,
): TableGroupsState {
  if (action.type === "collapse-all" || action.type === "expand-all") {
    return setLevelsExpanded(state, action);
  }

  if (action.type === "open") {
    const expanded = new Set([
      ...(action.base ?? state.expanded),
      ...action.ids,
    ]);

    return {
      ...state,
      expanded,
      picked: keepPickedGroups(state, expanded, action.picked),
      touched: true,
    };
  }

  // A layout that arrives keeps which groups are open: it opens only the first path of groups no layout has shown yet.
  if (action.type === "register") {
    return registerTableGroups(state, action);
  }

  if (action.type === "reset") {
    return resetTableGroups(state, action);
  }

  const expanded = toggleExpanded(action.base ?? state.expanded, action.id);

  return {
    ...state,
    expanded,
    picked: keepPickedGroups(state, expanded, action.picked),
    touched: true,
  };
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
 * The state once a layout shows its groups: seen ones keep their state, and the first path of unseen ones opens.
 */
function registerTableGroups(
  state: TableGroupsState,
  data: Readonly<{
    firstPath: readonly string[];
    groupIds: readonly string[];
    groupLevels: readonly number[];
  }>,
): TableGroupsState {
  const expanded = new Set(state.expanded);
  const seen = new Set(state.seen);

  for (const id of data.firstPath) {
    if (!seen.has(id)) {
      expanded.add(id);
    }
  }

  for (const id of data.groupIds) {
    seen.add(id);
  }

  if (
    areSameIds(state.groupIds, data.groupIds) &&
    areSameIds(state.groupLevels.map(String), data.groupLevels.map(String)) &&
    expanded.size === state.expanded.size &&
    seen.size === state.seen.size
  ) {
    return state;
  }

  return {
    ...state,
    expanded,
    groupIds: data.groupIds,
    groupLevels: data.groupLevels,
    seen,
  };
}

/**
 * The state after the table's data changed: every list starts over at the first page, and only the first path of groups is open.
 */
function resetTableGroups(
  state: TableGroupsState,
  data: Readonly<{
    firstPath: readonly string[];
    groupIds: readonly string[];
    groupLevels: readonly number[];
  }>,
): TableGroupsState {
  if (
    areSameIds(state.groupIds, data.groupIds) &&
    areSameIds(state.groupLevels.map(String), data.groupLevels.map(String)) &&
    hasSameMembers(state.expanded, data.firstPath) &&
    hasSameMembers(state.seen, data.groupIds) &&
    !state.touched &&
    state.picked.length + state.limits.size === 0 &&
    state.pages === 1
  ) {
    return state;
  }

  return {
    ...state,
    expanded: new Set(data.firstPath),
    groupIds: data.groupIds,
    groupLevels: data.groupLevels,
    limits: new Map(),
    pages: 1,
    picked: [],
    seen: new Set(data.groupIds),
    touched: false,
  };
}

/**
 * The state after the groups at some levels are all closed or all opened, the other levels left as they are.
 */
function setLevelsExpanded(
  state: TableGroupsState,
  action: Extract<TableGroupsAction, { type: "collapse-all" | "expand-all" }>,
): TableGroupsState {
  const expanded = new Set(action.base ?? state.expanded);

  for (const [index, id] of state.groupIds.entries()) {
    if (action.levels.includes(state.groupLevels[index] ?? -1)) {
      if (action.type === "expand-all") {
        expanded.add(id);
      } else {
        expanded.delete(id);
      }
    }
  }

  return {
    ...state,
    expanded,
    picked: keepPickedGroups(state, expanded),
    touched: true,
  };
}
