import {
  FilterChip,
  flattenFilterRules,
  useFilterState,
} from "@codebase/presentation";

import { TITLE } from "../../calendar-filters.constants";
import { isRequiredFilterRule } from "../../calendar-filters.utilities";

import type { EventFilterValue } from "../event-filter-model/event-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Folded, it draws only the required chips.
 */
export interface FilterChipRowProperties {
  className?: string;
  isFolded?: boolean;
}

// 🧩 Component

/**
 * Draws one chip per rule of the tree, nested ones included, in a row that wraps; it leaves out the Add filter button.
 */
export function FilterChipRow(
  properties: Readonly<FilterChipRowProperties>,
): ReactNode {
  const { className, isFolded = false } = properties;

  // 🪝 Hooks
  const { query } = useFilterState<EventFilterValue>();

  // 🏗 Setup
  const rules = isFolded
    ? flattenFilterRules(query).filter((rule) => isRequiredFilterRule(rule))
    : flattenFilterRules(query);

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
          required={isRequiredFilterRule(rule)}
          rule={rule}
        />
      ))}
    </div>
  );
}
