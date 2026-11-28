import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox } from "@codebase/presentation";

import {
  INDENT_REM,
  INDETERMINATE_CLASS_NAME,
  TAG_NOTE,
} from "./filter-tag-editor.constants";
import { describeHandle, showsPickCount } from "./filter-tag-editor.utilities";
import { TagRowDetail } from "./tag-row-detail";

import type { TagTreeRow } from "./event-filter-tag-tree.types";
import type { KeyboardEvent, ReactNode } from "react";

// 🔖 Type

/**
 * The row to draw, and its click, key, and open handlers.
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
 * Draws one tag's row: a checkbox, its indented name, a handle for tags beneath, and the picks inside when closed.
 */
export function TagRow(properties: Readonly<TagRowProperties>): ReactNode {
  const { className, onKeyDown, onOpenChange, onToggle, row } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { item } = row;
  const checked = row.state === "checked";
  const note = TAG_NOTE.safeParse(item.data).data?.note;

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
          if (row.isFolder) {
            onOpenChange(item.value, !row.isExpanded);
          } else {
            onToggle(item.value);
          }
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
            aria-label={describeHandle(row)}
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
        {row.isFolder ? null : (
          <Checkbox
            aria-hidden="true"
            checked={checked}
            className={INDETERMINATE_CLASS_NAME}
            indeterminate={row.state === "partial"}
            tabIndex={-1}
          />
        )}
        {item.icon === undefined ? null : (
          <span className="text-muted-foreground flex shrink-0 items-center">
            {item.icon}
          </span>
        )}
        <span className="flex min-w-0 grow flex-col">
          <span className="truncate">{row.name}</span>
          <TagRowDetail
            item={item}
            note={note}
          />
        </span>
        {showsPickCount(row) ? (
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
