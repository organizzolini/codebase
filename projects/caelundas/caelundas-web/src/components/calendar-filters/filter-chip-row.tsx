import {
  FilterChip,
  flattenFilterRules,
  useFilterState,
} from "@codebase/presentation";

import { TITLE } from "./calendar-filters.constants";

import type { EventFilterValue } from "./event-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Takes no props: its rules come from the surrounding `Filters`.
 */
export interface FilterChipRowProperties {
  className?: string;
}

// 🧩 Component

/**
 * Draws one chip per rule of the tree, nested ones included, in a row that wraps; it leaves out the Add filter button.
 */
export function FilterChipRow(
  properties: Readonly<FilterChipRowProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  const { query } = useFilterState<EventFilterValue>();

  // 🏗 Setup
  const rules = flattenFilterRules(query);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (rules.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      aria-label={TITLE}
      className={className}
      data-testid="filter-chip-row"
      role="toolbar"
      style={{ display: "contents" }}
    >
      {rules.map((rule, index) => (
        <FilterChip
          key={rule.id}
          index={index}
          rule={rule}
        />
      ))}
    </div>
  );
}
