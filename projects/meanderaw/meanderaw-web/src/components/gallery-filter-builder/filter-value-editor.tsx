import { FilterNumberInput } from "./filter-number-input";

import type {
  FilterField,
  FilterRule,
  FilterValue,
} from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A rule, its field, and what to do with the value picked.
 */
export interface FilterValueEditorProperties {
  className?: string;
  field: FilterField;
  onValueChange: (value: FilterValue) => void;
  rule: FilterRule;
}

// 🧩 Component

/**
 * Renders the editor a rule's value needs: a true or false pick, a text, a
 * number, or the two ends of a range.
 */
export function FilterValueEditor(
  properties: Readonly<FilterValueEditorProperties>,
): ReactNode {
  const { className, field, onValueChange, rule } = properties;
  const { value } = rule;

  // 🪝 Hooks

  // 🏗 Setup
  let editor: ReactNode;

  if (typeof value === "boolean") {
    editor = (
      <select
        aria-label="Value"
        className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
        onChange={(event) => {
          onValueChange(event.target.value === "true");
        }}
        value={String(value)}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  } else if (typeof value === "string") {
    editor = (
      <FilterNumberInput
        label="Value"
        onValueChange={onValueChange}
        value={value}
        isText
      />
    );
  } else if (typeof value === "number") {
    editor = (
      <FilterNumberInput
        isInteger={field.isInteger}
        label="Value"
        onValueChange={onValueChange}
        value={value}
      />
    );
  } else {
    editor = (
      <>
        <FilterNumberInput
          isInteger={field.isInteger}
          label="From"
          onValueChange={(low) => {
            onValueChange([Number(low), value[1]]);
          }}
          value={value[0]}
        />
        <FilterNumberInput
          isInteger={field.isInteger}
          label="To"
          onValueChange={(high) => {
            onValueChange([value[0], Number(high)]);
          }}
          value={value[1]}
        />
      </>
    );
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-value-editor"
      style={{ display: "contents" }}
    >
      {editor}
    </div>
  );
}
