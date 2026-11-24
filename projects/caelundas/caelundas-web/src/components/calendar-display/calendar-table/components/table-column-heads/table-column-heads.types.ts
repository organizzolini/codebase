import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";

// 🏷️ Types

/** The handlers, column ids and sorts a header's actions use. */
export interface HeaderActionContext {
  ids: readonly string[];
  onColumnsChange?:
    | ((columns: readonly string[] | undefined) => void)
    | undefined;
  onSortChange?: ((sort: GroupSort[] | undefined) => void) | undefined;
  sort: readonly GroupSort[];
}

/** The key and tag a sort orders by. */
export type SortTarget = Pick<GroupSort, "key" | "tag">;
