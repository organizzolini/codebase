import {
  filterOperatorSchema,
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
} from "../../gallery-filter-builder.constants";
import { changeRuleOperator } from "../../gallery-filter-builder.utilities";
import { FilterValueEditor } from "../filter-value-editor/filter-value-editor";

import type {
  FilterField,
  FilterRule,
} from "../../gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The attribute, its rule, and what to do with an edit.
 */
export interface FilterOperandEditorProperties {
  className?: string;
  field: FilterField;
  onRuleChange: (rule: FilterRule) => void;
  rule: FilterRule;
}

// 🧩 Component

/**
 * Renders the operator pick and the value editor a rule on an attribute needs.
 */
export function FilterOperandEditor(
  properties: Readonly<FilterOperandEditorProperties>,
): ReactNode {
  const { className, field, onRuleChange, rule } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-operand-editor"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          aria-label="Operator"
          className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
          onChange={(event) => {
            onRuleChange(
              changeRuleOperator(
                rule,
                filterOperatorSchema.parse(event.target.value),
              ),
            );
          }}
          value={rule.operator}
        >
          {OPERATORS_BY_TYPE[field.type].map((operator) => (
            <option
              key={operator}
              value={operator}
            >
              {OPERATOR_LABELS[operator]}
            </option>
          ))}
        </select>
        <FilterValueEditor
          field={field}
          onValueChange={(value) => {
            onRuleChange({ ...rule, value });
          }}
          rule={rule}
        />
      </div>
    </div>
  );
}
