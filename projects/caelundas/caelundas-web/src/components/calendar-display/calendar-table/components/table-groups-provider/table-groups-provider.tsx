import { useMemo, useReducer } from "react";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "./table-groups-provider.constants";
import {
  getCollapseActions,
  reduceTableGroups,
} from "./table-groups-provider.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/** What the toolbar and the table share the groups and pages of. */
export interface TableGroupsProviderProperties {
  children?: ReactNode;
  className?: string;
}

// 🧩 Component

/**
 * Holds which of the table's groups are closed and how many pages show, so the table and the toolbar's strips, which sit outside it, agree on them.
 */
export function TableGroupsProvider(
  properties: Readonly<TableGroupsProviderProperties>,
): ReactNode {
  const { children, className } = properties;

  // 🪝 Hooks
  const [state, dispatch] = useReducer(reduceTableGroups, INITIAL_TABLE_GROUPS);
  const value = useMemo(
    () => ({
      ...getCollapseActions(state.groupIds, state.expanded),
      collapseAll: () => {
        dispatch({ type: "collapse-all" });
      },
      dispatch,
      expandAll: () => {
        dispatch({ type: "expand-all" });
      },
      provided: true,
      state,
    }),
    [state],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <TableGroupsContext value={value}>
      <div
        className={className}
        data-testid="table-groups-provider"
      >
        {children}
      </div>
    </TableGroupsContext>
  );
}
