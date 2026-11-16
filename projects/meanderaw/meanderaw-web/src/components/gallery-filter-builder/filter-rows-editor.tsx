import { normalizeRule } from "./filter-limits.utilities";
import { toRowsRule } from "./filter-rows.utilities";
import { FilterValueEditor } from "./filter-value-editor";
import {
  filterOperatorSchema,
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
  ROWS_FILTER_FIELD,
} from "./gallery-filter-builder.constants";
import { changeRuleOperator } from "./gallery-filter-builder.utilities";

import type { RowsFilter } from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The rows rule and what to do with an edit of it.
 */
export interface FilterRowsEditorProperties {
  className?: string;
  onRowsChange: (rows: RowsFilter) => void;
  rows: RowsFilter;
}

// 🧩 Component

/**
 * Renders the rows rule every filter holds: its operator and value can
 * change, yet it cannot be removed.
 */
export function FilterRowsEditor(
  properties: Readonly<FilterRowsEditorProperties>,
): ReactNode {
  const { className, onRowsChange, rows } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const rule = toRowsRule(rows);

  // 💪 Handlers
  const handleChange = (changed: typeof rule): void => {
    const { operator, value } = normalizeRule(changed);

    onRowsChange({ operator, value });
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-rows-editor"
    >
      <div
        aria-label="Required rows filter"
        className="flex flex-wrap items-center gap-2 rounded-md border border-(--line) p-2 text-sm"
        role="group"
      >
        <span className="font-medium">{ROWS_FILTER_FIELD.label}</span>
        <select
          aria-label="Rows operator"
          className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
          onChange={(event) => {
            handleChange(
              changeRuleOperator(
                rule,
                filterOperatorSchema.parse(event.target.value),
              ),
            );
          }}
          value={rows.operator}
        >
          {OPERATORS_BY_TYPE.number.map((operator) => (
            <option
              key={operator}
              value={operator}
            >
              {OPERATOR_LABELS[operator]}
            </option>
          ))}
        </select>
        <FilterValueEditor
          field={ROWS_FILTER_FIELD}
          labelPrefix="Rows "
          onValueChange={(value) => {
            handleChange({ ...rule, value });
          }}
          rule={rule}
        />
        <button
          className="rounded-md border border-(--line) px-2 py-1 disabled:opacity-50"
          title="Every filter requires a rows rule"
          type="button"
          disabled
        >
          Remove rows rule
        </button>
      </div>
    </div>
  );
}
