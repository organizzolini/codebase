import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox, Input } from "@codebase/presentation";

import { useTagPicker } from "./use-tag-picker";

import type { TagTreeRow } from "../lib/event-filters/event-filter-tag-tree";
import type { FilterEditorProps } from "@codebase/presentation";
import type { KeyboardEvent, ReactNode } from "react";

// 🔖 Type

/**
 * What the builder hands every value editor. Its value is read as a list of
 * tag ids, whatever the registry's type says.
 */
export interface FilterTagEditorProperties extends FilterEditorProps {
  /**
   * Whether picking a tag picks everything beneath it and a tag with only some
   * of its tags picked is shown partly picked; on when absent.
   */
  cascade?: boolean | undefined;
  className?: string;
}

const INDENT_REM = 0.875;

// A partly ticked tag is a box with a dash in place of the check.
const INDETERMINATE_CLASS_NAME =
  "pointer-events-none before:hidden before:h-0.5 before:w-2 before:rounded-full before:bg-primary data-indeterminate:border-primary data-indeterminate:before:block data-indeterminate:[&_svg]:hidden";

// 🧩 Component

/**
 * Renders the value editor of a tag field: a search box over the tag tree,
 * each tag a checkbox by its own name with the events it matches. A tag with
 * tags beneath it has a handle that opens or closes them, so a deep tree can
 * be folded down to its first level; it opens already showing the tags the
 * rule holds, and a closed tag says how many picks are inside it. Searching
 * lists every match, open or not. Ticking a tag takes everything beneath it,
 * and a tag with only some of its tags ticked shows a dash. Every tick is
 * written at once and the list stays open, so several can be picked together;
 * Escape closes it.
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

/**
 * Draws one tag's row: a handle to open or close it when it has tags beneath
 * it, a checkbox, its name indented by its depth, the picks inside it while
 * it is closed, and the events it matches.
 */
function TagRow(
  properties: Readonly<{
    onKeyDown: (event: KeyboardEvent<HTMLElement>, row: TagTreeRow) => void;
    onOpenChange: (id: string, open: boolean) => void;
    onToggle: (id: string) => void;
    row: TagTreeRow;
  }>,
): ReactNode {
  const { onKeyDown, onOpenChange, onToggle, row } = properties;
  const { item } = row;
  const checked = row.state === "checked";

  return (
    <div
      aria-selected={checked}
      className="hover:bg-accent focus-visible:bg-accent flex w-full cursor-default items-center gap-1 rounded-md py-1 pr-2 text-sm outline-hidden"
      onClick={() => {
        onToggle(item.value);
      }}
      onKeyDown={(event) => {
        onKeyDown(event, row);
      }}
      role="option"
      style={{ paddingLeft: `${String(0.125 + row.depth * INDENT_REM)}rem` }}
      tabIndex={-1}
    >
      {row.hasChildren ? (
        <button
          aria-expanded={row.isExpanded}
          aria-label={`${row.isExpanded ? "Collapse" : "Expand"} ${row.name}`}
          className="text-muted-foreground hover:bg-muted flex size-5 shrink-0 items-center justify-center rounded-sm"
          onClick={(event) => {
            event.stopPropagation();
            onOpenChange(item.value, !row.isExpanded);
          }}
          tabIndex={-1}
          type="button"
        >
          {row.isExpanded ? (
            <ChevronDown
              aria-hidden="true"
              className="size-4"
            />
          ) : (
            <ChevronRight
              aria-hidden="true"
              className="size-4"
            />
          )}
        </button>
      ) : (
        <span
          aria-hidden="true"
          className="size-5 shrink-0"
        />
      )}
      <Checkbox
        aria-hidden="true"
        checked={checked}
        className={INDETERMINATE_CLASS_NAME}
        indeterminate={row.state === "partial"}
        tabIndex={-1}
      />
      <span className="min-w-0 grow truncate">{row.name}</span>
      {row.hasChildren && !row.isExpanded && row.selectedBelow > 0 ? (
        <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-1.5 text-xs tabular-nums">
          {row.selectedBelow}
        </span>
      ) : null}
      {item.description === undefined ? null : (
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {item.description}
        </span>
      )}
    </div>
  );
}
