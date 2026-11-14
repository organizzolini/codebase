import {
  describeRule,
  listRules,
  removeNode,
} from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FILTERS_TITLE } from "./gallery-filters.constants";

import type {
  FilterField,
  FilterGroup,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tree whose rules are drawn, their fields, and the edit.
 */
export interface FilterChipRowProperties {
  className?: string;
  fields: readonly FilterField[];
  filter: FilterGroup | undefined;
  /** Called with the tree left after a chip is removed, none when empty. */
  onFilterChange: (filter: FilterGroup | undefined) => void;
}

// 🧩 Component

/**
 * Renders one removable chip for each rule of the tree, nested ones
 * included, in a row that wraps.
 */
export function FilterChipRow(
  properties: Readonly<FilterChipRowProperties>,
): ReactNode {
  const { className, fields, filter, onFilterChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const entries = filter === undefined ? [] : listRules(filter);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (filter === undefined || entries.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-chip-row"
    >
      <ul
        aria-label={`Active ${FILTERS_TITLE.toLowerCase()}s`}
        className="flex flex-wrap gap-2"
      >
        {entries.map(({ path, rule }) => {
          const text = describeRule(rule, fields);

          return (
            <li
              key={path.join(".")}
              className="flex items-center gap-1 rounded-full border border-(--line) bg-(--surface-raised) py-1 pr-1 pl-3 text-sm"
            >
              {text}
              <button
                aria-label={`Remove ${text}`}
                className="rounded-full px-2"
                onClick={() => {
                  const next = removeNode(path)(filter);

                  onFilterChange(next.rules.length === 0 ? undefined : next);
                }}
                type="button"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
