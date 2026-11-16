import { FilterValueEditor } from "../gallery-filter-builder/filter-value-editor";
import {
  filterOperatorSchema,
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
} from "../gallery-filter-builder/gallery-filter-builder.constants";
import {
  changeRuleOperator,
  describeRule,
} from "../gallery-filter-builder/gallery-filter-builder.utilities";

import type {
  FilterField,
  FilterRule,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A rule, its attribute, and its handlers.
 */
export interface FilterPillProperties {
  className?: string;
  /** The attribute the rule names, or none when the catalog lacks it. */
  field: FilterField | undefined;
  /** Called to remove the rule; a pill given none cannot be removed. */
  onRemove?: (() => void) | undefined;
  onRuleChange: (rule: FilterRule) => void;
  rule: FilterRule;
}

// 🧩 Component

/**
 * Renders one filter as a button group: attribute, operator, value, and × unless required.
 */
export function FilterPill(
  properties: Readonly<FilterPillProperties>,
): ReactNode {
  const { className, field, onRemove, onRuleChange, rule } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const label = field?.label ?? rule.field;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-pill"
    >
      <div
        aria-label={`Filter ${label}`}
        className="inline-flex items-stretch overflow-hidden rounded-md border border-(--line) bg-(--surface-raised) text-sm"
        role="group"
      >
        <span
          className="flex items-center bg-(--surface-sunken) px-2"
          title={field?.description}
        >
          {label}
        </span>
        {field === undefined ? (
          <span className="flex items-center px-2">
            {describeRule(rule, [])}
          </span>
        ) : (
          <>
            <select
              aria-label={`${label} operator`}
              className="border-l border-(--line) bg-transparent px-1"
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
              labelPrefix={`${label} `}
              onValueChange={(value) => {
                onRuleChange({ ...rule, value });
              }}
              rule={rule}
            />
          </>
        )}
        {onRemove !== undefined && (
          <button
            aria-label={`Remove ${label} filter`}
            className="border-l border-(--line) px-2"
            onClick={onRemove}
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
