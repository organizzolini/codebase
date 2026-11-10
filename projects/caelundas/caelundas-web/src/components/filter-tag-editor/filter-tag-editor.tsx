import { Input } from "@codebase/presentation";

import { useTagPicker } from "../../hooks/use-tag-picker/use-tag-picker";

import { TagRow } from "./tag-row";

import type { FilterEditorProps } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the builder hands every value editor. Its value is read as a list of
 * tag ids, whatever the registry's type says.
 */
export interface FilterTagEditorProperties extends FilterEditorProps {
  /**
   * Picking a tag picks everything beneath it, and partial tags show as partly picked; on when absent.
   */
  cascade?: boolean | undefined;
  className?: string;
}

// 🧩 Component

/**
 * Renders a tag field's value editor: a searchable checkbox tree, where ticking a tag takes all beneath it; Escape closes it.
 */
export function FilterTagEditor(
  properties: Readonly<FilterTagEditorProperties>,
): ReactNode {
  const { autoFocusProps, className, field, options } = properties;

  // 🪝 Hooks
  const {
    handleOpen,
    handleOptionKeyDown,
    handleSearchKeyDown,
    handleToggle,
    rows,
  } = useTagPicker(properties);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-tag-editor"
    >
      <div className="flex w-72 max-w-[90vw] flex-col gap-1 p-1">
        <Input
          {...autoFocusProps}
          aria-label={`Search ${field.label}`}
          onChange={(event) => {
            options.setQuery(event.target.value);
          }}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search..."
          value={options.query}
        />
        <div
          aria-label={field.label}
          aria-multiselectable="true"
          className="max-h-72 overflow-y-auto"
          role="listbox"
        >
          {rows.map((row) => (
            <TagRow
              key={row.item.value}
              onKeyDown={handleOptionKeyDown}
              onOpenChange={handleOpen}
              onToggle={handleToggle}
              row={row}
            />
          ))}
          {rows.length === 0 ? (
            <p className="text-muted-foreground px-2 py-3 text-center text-sm">
              No matches
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
