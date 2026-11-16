import { normalizeRule } from "../gallery-filter-builder/filter-limits.utilities";
import { toRowsRule } from "../gallery-filter-builder/filter-rows.utilities";
import { ROWS_FILTER_FIELD } from "../gallery-filter-builder/gallery-filter-builder.constants";

import { FilterPill } from "./filter-pill";
import { FilterPillGroup } from "./filter-pill-group";

import type {
  FilterEdit,
  FilterField,
  FilterGroup,
  RowsFilter,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The rows rule and tree shown as pills, and the edits.
 */
export interface FilterPillRowProperties {
  className?: string;
  fields: readonly FilterField[];
  filter: FilterGroup | undefined;
  onEdit: (edit: FilterEdit) => void;
  onRowsChange: (rows: RowsFilter) => void;
  /** The rows rule every filter holds; its pill has no remove button. */
  rows: RowsFilter;
}

// 🧩 Component

/**
 * Renders the filters in force as a wrapping row of pills: the rows rule
 * first, which stays, then the tree's, each editable in place.
 */
export function FilterPillRow(
  properties: Readonly<FilterPillRowProperties>,
): ReactNode {
  const { className, fields, filter, onEdit, onRowsChange, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-pill-row"
    >
      <div
        aria-label="Active filters"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        <FilterPill
          field={ROWS_FILTER_FIELD}
          onRuleChange={(rule) => {
            const { operator, value } = normalizeRule(rule);

            onRowsChange({ operator, value });
          }}
          rule={toRowsRule(rows)}
        />
        {filter !== undefined && filter.rules.length > 0 && (
          <>
            <span
              aria-hidden="true"
              className="text-xs text-(--ink-muted)"
            >
              and
            </span>
            <FilterPillGroup
              className="contents"
              fields={fields}
              group={filter}
              onEdit={onEdit}
              path={[]}
            />
          </>
        )}
      </div>
    </div>
  );
}
