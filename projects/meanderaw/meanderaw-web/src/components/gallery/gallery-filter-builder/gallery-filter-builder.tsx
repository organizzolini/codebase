import { useState } from "react";

import { FilterAttributeSearch } from "./components/filter-attribute-search/filter-attribute-search";
import { FilterOperandEditor } from "./components/filter-operand-editor/filter-operand-editor";
import { createRule } from "./gallery-filter-builder.utilities";

import type { FilterField, FilterRule } from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The attributes, whether the filter is full, and the add.
 */
export interface GalleryFilterBuilderProperties {
  className?: string;
  fields: readonly FilterField[];
  /** Whether the filter holds as many rules as the API takes. */
  isFull: boolean;
  /** Called with the finished rule when Add filter is pressed. */
  onAdd: (rule: FilterRule) => void;
}

// 🧩 Component

/**
 * Renders the add-a-filter steps: search and pick an attribute, then its
 * operator and value, then Add filter.
 */
export function GalleryFilterBuilder(
  properties: Readonly<GalleryFilterBuilderProperties>,
): ReactNode {
  const { className, fields, isFull, onAdd } = properties;

  // 🪝 Hooks
  const [draft, setDraft] = useState<
    undefined | { field: FilterField; rule: FilterRule }
  >();

  // 🏗 Setup

  // 💪 Handlers
  const handleAdd = (): void => {
    if (draft !== undefined) {
      onAdd(draft.rule);
      setDraft(undefined);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-filter-builder"
    >
      {draft === undefined ? (
        <FilterAttributeSearch
          fields={fields}
          onSelect={(field) => {
            setDraft({ field, rule: createRule(field) });
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              <span className="font-medium">{draft.field.label}</span>
              <span className="text-xs text-(--ink-muted)">
                {draft.field.description}
              </span>
            </div>
            <button
              className="rounded-md border border-(--line) px-2 py-1 text-sm"
              onClick={() => {
                setDraft(undefined);
              }}
              type="button"
            >
              Change attribute
            </button>
          </div>
          <FilterOperandEditor
            field={draft.field}
            onRuleChange={(rule) => {
              setDraft({ field: draft.field, rule });
            }}
            rule={draft.rule}
          />
          <button
            className="self-start rounded-md bg-(--accent) px-3 py-1 text-sm text-(--accent-ink) disabled:opacity-50"
            disabled={
              isFull ||
              (typeof draft.rule.value === "string" &&
                draft.rule.value.trim() === "")
            }
            onClick={handleAdd}
            type="button"
          >
            Add filter
          </button>
        </div>
      )}
    </div>
  );
}
