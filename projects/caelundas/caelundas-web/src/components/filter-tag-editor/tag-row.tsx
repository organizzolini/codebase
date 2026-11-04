import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox } from "@codebase/presentation";

import {
  INDENT_REM,
  INDETERMINATE_CLASS_NAME,
} from "./filter-tag-editor.constants";

import type { TagTreeRow } from "./event-filter-tag-tree.types";
import type { KeyboardEvent, ReactNode } from "react";

// 🔖 Type

/**
 * The tag to draw and what a click, a key, or its handle does to it.
 */
export interface TagRowProperties {
  className?: string;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, row: TagTreeRow) => void;
  onOpenChange: (id: string, open: boolean) => void;
  onToggle: (id: string) => void;
  row: TagTreeRow;
}

// 🧩 Component

/**
 * Draws one tag's row: a handle to open or close it when it has tags beneath
 * it, a checkbox, its name indented by its depth, the picks inside it while
 * it is closed, and the events it matches.
 */
export function TagRow(properties: Readonly<TagRowProperties>): ReactNode {
  const { className, onKeyDown, onOpenChange, onToggle, row } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { item } = row;
  const checked = row.state === "checked";

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-row"
      style={{ display: "contents" }}
    >
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
    </div>
  );
}
