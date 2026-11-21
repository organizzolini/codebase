import type { FilterField } from "../../gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * An attribute, its place in the list, and its handlers.
 */
export interface FilterAttributeOptionProperties {
  className?: string;
  field: FilterField;
  /** The id the list's active-descendant names this option by. */
  id: string;
  isActive: boolean;
  onActivate: () => void;
  onSelect: () => void;
}

// 🧩 Component

/**
 * Renders one attribute of the list: its name, its kind, a pattern marker
 * and its description.
 */
export function FilterAttributeOption(
  properties: Readonly<FilterAttributeOptionProperties>,
): ReactNode {
  const { className, field, id, isActive, onActivate, onSelect } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-attribute-option"
    >
      <button
        aria-selected={isActive}
        className="flex w-full flex-col gap-0.5 rounded-md px-2 py-1 text-left text-sm aria-selected:bg-(--surface-raised)"
        id={id}
        onClick={onSelect}
        onMouseMove={onActivate}
        role="option"
        tabIndex={-1}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span>{field.label}</span>
          <span className="rounded border border-(--line) px-1 text-xs text-(--ink-muted)">
            {field.type}
          </span>
          {field.isPattern && (
            <span className="rounded bg-(--accent) px-1 text-xs text-(--accent-ink)">
              pattern
            </span>
          )}
        </span>
        <span className="truncate text-xs text-(--ink-muted)">
          {field.description}
        </span>
      </button>
    </div>
  );
}
