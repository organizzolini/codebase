import { useMemo } from "react";

import { QueryCascader } from "../../../query-cascader/query-cascader";

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
  onQueryChange: (query: EventFilterQuery) => void;
  query: EventFilterQuery;
}

// 🧩 Component

/**
 * Renders a searchable Cascader of the attributes to filter by, each opening to the values it takes in columns to the right; every value ticked narrows the calendar, all of them together.
 */
export function FilterCascader(
  properties: Readonly<FilterCascaderProperties>,
): ReactNode {
  const { className, fields, onQueryChange, query } = properties;

  // 🪝 Hooks
  const items = useMemo(() => createFilterItems(fields), [fields]);

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
        items={items}
        mode="columns"
        onValueChange={(next) => {
          onQueryChange(toFilterQuery(next, fields, query));
        }}
        placeholder="Search attributes"
        selectable={isValue}
        value={toFilterValue(fields, query)}
        multiple
      />
    </div>
  );
}
