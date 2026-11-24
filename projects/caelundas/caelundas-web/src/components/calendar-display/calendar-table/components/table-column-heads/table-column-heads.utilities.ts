import { moveListItem } from "../../../../calendar-query/calendar-group-strip/components/chip-menu/chip-menu.utilities";

import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { TableColumn } from "../../calendar-table.types";
import type { HeaderActions } from "../table-header-cell/table-header-cell.types";
import type {
  HeaderActionContext,
  SortTarget,
} from "./table-column-heads.types";

// 🔏 Private Functions

/**
 * The sorts without the column's, or nothing when none are left.
 */
export function clearColumnSort(
  sort: readonly GroupSort[],
  column: TableColumn,
): GroupSort[] | undefined {
  const target = getColumnSort(column);
  const rest =
    target === undefined
      ? [...sort]
      : sort.filter((entry) => !isSameTarget(entry, target));

  return rest.length === 0 ? undefined : rest;
}

/**
 * What a header's menu does: sort, move, and deselect the column, each left out when it cannot apply.
 */
export function createHeaderActions(
  column: TableColumn,
  context: Readonly<HeaderActionContext>,
): HeaderActions {
  return {
    ...createColumnActions(column, context),
    ...createSortActions(column, context),
  };
}

/**
 * The sort a column orders groups by: name, first event, or its tag; none for a column that cannot sort.
 */
export function getColumnSort(column: TableColumn): SortTarget | undefined {
  if (column.kind === "name") {
    return { key: "name" };
  }

  if (column.kind === "start" || column.kind === "end") {
    return { key: "first" };
  }

  return column.kind === "tag" ? { key: "tag", tag: column.id } : undefined;
}

// 🌎 Public Functions

/**
 * The direction the column is the primary sort in, or nothing when another sort leads.
 */
export function getSortDirection(
  sort: readonly GroupSort[],
  column: TableColumn,
): "asc" | "desc" | undefined {
  const target = getColumnSort(column);
  const [primary] = sort;

  return target !== undefined &&
    primary !== undefined &&
    isSameTarget(primary, target)
    ? primary.direction
    : undefined;
}

/**
 * The sorts with the column's put first in a direction, replacing its earlier entry.
 */
export function setColumnSort(
  sort: readonly GroupSort[],
  column: TableColumn,
  direction: "asc" | "desc",
): GroupSort[] {
  const target = getColumnSort(column);

  if (target === undefined) {
    return [...sort];
  }

  return [
    { ...target, direction },
    ...sort.filter((entry) => !isSameTarget(entry, target)),
  ];
}

/**
 * The column's move and remove actions, each left out when it cannot apply.
 */
function createColumnActions(
  column: TableColumn,
  context: Readonly<HeaderActionContext>,
): HeaderActions {
  const { ids, onColumnsChange } = context;
  const index = ids.indexOf(column.id);

  if (onColumnsChange === undefined || index === -1) {
    return {};
  }

  return {
    onMoveLeft:
      index === 0
        ? undefined
        : () => {
            onColumnsChange(moveListItem(ids, index, -1));
          },
    onMoveRight:
      index === ids.length - 1
        ? undefined
        : () => {
            onColumnsChange(moveListItem(ids, index, 1));
          },
    onRemove:
      ids.length < 2
        ? undefined
        : () => {
            onColumnsChange(ids.filter((id) => id !== column.id));
          },
  };
}

/**
 * The column's sort actions, each left out when it cannot apply.
 */
function createSortActions(
  column: TableColumn,
  context: Readonly<HeaderActionContext>,
): HeaderActions {
  const { onSortChange, sort } = context;
  const target = getColumnSort(column);

  if (onSortChange === undefined || target === undefined) {
    return {};
  }

  return {
    onClearSort:
      getSortDirection(sort, column) === undefined
        ? undefined
        : () => {
            onSortChange(clearColumnSort(sort, column));
          },
    onSort: (direction) => {
      onSortChange(setColumnSort(sort, column, direction));
    },
  };
}

/**
 * Whether a sort orders by the target.
 */
function isSameTarget(sort: GroupSort, target: SortTarget): boolean {
  return sort.key === target.key && sort.tag === target.tag;
}
