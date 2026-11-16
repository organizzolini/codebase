import { toRowsRule } from "../gallery-filter-builder/filter-rows.utilities";
import { EMPTY_FILTER_GROUP } from "../gallery-filter-builder/gallery-filter-builder.constants";
import {
  describeRule,
  listRules,
  removeNode,
} from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FILTERS_TITLE } from "./gallery-filters.constants";

import type {
  FilterField,
  FilterGroup,
  RowsFilter,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The rows rule and the tree drawn, their fields, and the edit.
 */
export interface FilterChipRowProperties {
  className?: string;
  fields: readonly FilterField[];
  filter: FilterGroup | undefined;
  /** Called with the tree left after a chip is removed, none when empty. */
  onFilterChange: (filter: FilterGroup | undefined) => void;
  /** The rows rule every filter holds; its chip has no remove button. */
  rows: RowsFilter;
}

// 🧩 Component

/**
 * Renders the rows rule as a chip that stays, then a removable chip for each tree rule.
 */
export function FilterChipRow(
  properties: Readonly<FilterChipRowProperties>,
): ReactNode {
  const { className, fields, filter, onFilterChange, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const entries = filter === undefined ? [] : listRules(filter);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
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
        <li className="rounded-full border border-(--line) bg-(--surface-raised) px-3 py-1 text-sm">
          {describeRule(toRowsRule(rows), fields)}
        </li>
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
                  const next = removeNode(path)(filter ?? EMPTY_FILTER_GROUP);

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
