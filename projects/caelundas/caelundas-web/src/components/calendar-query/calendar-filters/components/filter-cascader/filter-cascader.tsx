import { useMemo } from "react";

import { QueryCascader } from "../../../query-cascader/query-cascader";
import { keepHiddenValues } from "../../../query-cascader/query-cascader.utilities";

import {
  createFilterItems,
  isValue,
  toFilterQuery,
  toFilterValue,
} from "./filter-cascader.utilities";

import type {
  EventFilterField,
  EventFilterQuery,
} from "../event-filter-model/event-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The attributes to filter by, the filter shown, and the change handler.
 */
export interface FilterCascaderProperties {
  className?: string;
  fields: readonly EventFilterField[];
  /**
   * The fields offered to pick from, when fewer than `fields`; filters already on the others stay.
   */
  offered?: readonly EventFilterField[] | undefined;
  onQueryChange: (query: EventFilterQuery) => void;
  query: EventFilterQuery;
}

// 🧩 Component

/** Renders the searchable tree of attributes to filter by, each expanding to its values; every ticked value narrows the calendar. */
export function FilterCascader(
  properties: Readonly<FilterCascaderProperties>,
): ReactNode {
  const {
    className,
    fields,
    offered = fields,
    onQueryChange,
    query,
  } = properties;

  // 🪝 Hooks
  const items = useMemo(() => createFilterItems(offered), [offered]);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-cascader"
    >
      <QueryCascader
        cascade={false}
        items={items}
        mode="tree"
        onValueChange={(next) => {
          onQueryChange(
            toFilterQuery(
              keepHiddenValues(next, toFilterValue(fields, query), items),
              fields,
              query,
            ),
          );
        }}
        placeholder="Search attributes"
        selectable={isValue}
        value={toFilterValue(fields, query)}
        multiple
      />
    </div>
  );
}
