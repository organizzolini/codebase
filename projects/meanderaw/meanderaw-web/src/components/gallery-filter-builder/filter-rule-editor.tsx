import { FilterValueEditor } from "./filter-value-editor";
import {
  filterOperatorSchema,
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
} from "./gallery-filter-builder.constants";
import {
  changeRuleField,
  changeRuleOperator,
  describeField,
  removeNode,
  setRule,
} from "./gallery-filter-builder.utilities";

import type {
  FilterEdit,
  FilterField,
  FilterRule,
} from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A rule, its place in the tree, and how to edit it.
 */
export interface FilterRuleEditorProperties {
  className?: string;
  fields: readonly FilterField[];
  onEdit: (edit: FilterEdit) => void;
  /** The index of each node from the root down to this rule. */
  path: readonly number[];
  rule: FilterRule;
}

// 🧩 Component

/**
 * Renders one rule: pickers for its field and operator, an editor for its
 * value, a button that removes it, and what its field measures.
 */
export function FilterRuleEditor(
  properties: Readonly<FilterRuleEditorProperties>,
): ReactNode {
  const { className, fields, onEdit, path, rule } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const field = fields.find(({ key }) => key === rule.field);
  const name = `Filter rule ${path.map((index) => index + 1).join(".")}`;

  // 💪 Handlers
  const handleFieldChange = (key: string): void => {
    const next = fields.find((candidate) => candidate.key === key);

    if (next !== undefined) {
      onEdit(setRule(path, changeRuleField(rule, next)));
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-label={name}
      className={className}
      data-testid="filter-rule-editor"
      role="group"
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            aria-label="Field"
            className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
            onChange={(event) => {
              handleFieldChange(event.target.value);
            }}
            value={rule.field}
          >
            {field === undefined && (
              <option value={rule.field}>{rule.field}</option>
            )}
            <optgroup label="Shape">
              {fields
                .filter(({ category }) => category === "shape")
                .map(({ isPattern, key, label }) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {isPattern ? `${label} (pattern)` : label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Characteristics">
              {fields
                .filter(({ category }) => category !== "shape")
                .map(({ isPattern, key, label }) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {isPattern ? `${label} (pattern)` : label}
                  </option>
                ))}
            </optgroup>
          </select>
          {field !== undefined && (
            <>
              <select
                aria-label="Operator"
                className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
                onChange={(event) => {
                  onEdit(
                    setRule(
                      path,
                      changeRuleOperator(
                        rule,
                        filterOperatorSchema.parse(event.target.value),
                      ),
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
                  onEdit(setRule(path, { ...rule, value }));
                }}
                rule={rule}
              />
            </>
          )}
          <button
            className="rounded-md border border-(--line) px-2 py-1"
            onClick={() => {
              onEdit(removeNode(path));
            }}
            type="button"
          >
            Remove rule
          </button>
        </div>
        {field !== undefined && (
          <p
            className="text-xs text-(--ink-muted)"
            data-testid="filter-field-details"
          >
            {describeField(field)}
          </p>
        )}
      </div>
    </div>
  );
}
