import { Checkbox, Input } from "@codebase/presentation";

import type { FilterEditorProps, FilterOption } from "@codebase/presentation";
import type { KeyboardEvent, ReactNode } from "react";

// 🔖 Type

/**
 * What the builder hands every value editor. Its value is read as a list of
 * tag ids, whatever the registry's type says.
 */
export interface FilterTagEditorProperties extends FilterEditorProps {
  className?: string;
}

/**
 * What a tag option carries beyond its label: how deep the tag sits beneath
 * its root, and its own name, which the row shows in place of the path the
 * chip is labeled with.
 */
export interface TagOptionData {
  depth: number;
  name: string;
}

const INDENT_REM = 0.875;

// 🧩 Component

/**
 * Renders the value editor of a tag field: a search box over a list with one
 * checkbox for each tag, its own name and not its path, indented beneath the
 * tag it belongs to, with the events it matches. Each tag is ticked or not on
 * its own, and ticking one also takes everything beneath it. Every tick is
 * written at once and the list stays open, so several can be picked together;
 * Escape closes it.
 */
export function FilterTagEditor(
  properties: Readonly<FilterTagEditorProperties>,
): ReactNode {
  const {
    autoFocusProps,
    cancel,
    className,
    commit,
    field,
    onValueChange,
    options,
    value,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const selected: readonly unknown[] = Array.isArray(value) ? value : [];

  // 💪 Handlers
  const handleToggle = (id: string): void => {
    const next = selected.includes(id)
      ? selected.filter((picked) => picked !== id)
      : [...selected, id];

    onValueChange(next);
    commit(next, { close: false });
  };
  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      event.currentTarget
        .closest("[data-testid='filter-tag-editor']")
        ?.querySelector<HTMLElement>("[role='option']")
        ?.focus();
    }
  };
  const handleOptionKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const rows = [
      ...(event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
        "[role='option']",
      ) ?? []),
    ];
    const index = rows.indexOf(event.currentTarget);
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];

    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    } else if (step !== undefined) {
      event.preventDefault();
      rows[index + step]?.focus();
    }
  };

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
          {options.items.map((item) => (
            <TagRow
              key={item.value}
              checked={selected.includes(item.value)}
              item={item}
              onKeyDown={handleOptionKeyDown}
              onToggle={handleToggle}
            />
          ))}
          {options.items.length === 0 ? (
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
 * Reads what a tag option carries, or nothing for an option of another kind.
 */
function readTagOptionData(data: unknown): TagOptionData | undefined {
  if (
    typeof data === "object" &&
    data !== null &&
    "depth" in data &&
    "name" in data &&
    typeof data.depth === "number" &&
    typeof data.name === "string"
  ) {
    return { depth: data.depth, name: data.name };
  }

  return undefined;
}

/**
 * Draws one tag's row: a checkbox, its name indented by its depth, and the
 * events it matches.
 */
function TagRow(
  properties: Readonly<{
    checked: boolean;
    item: FilterOption;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    onToggle: (id: string) => void;
  }>,
): ReactNode {
  const { checked, item, onKeyDown, onToggle } = properties;
  const data = readTagOptionData(item.data);

  return (
    <div
      aria-selected={checked}
      className="hover:bg-accent focus-visible:bg-accent flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-2 text-sm outline-hidden"
      onClick={() => {
        onToggle(item.value);
      }}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          onToggle(item.value);
        } else {
          onKeyDown(event);
        }
      }}
      role="option"
      style={{
        paddingLeft: `${String(0.375 + (data?.depth ?? 0) * INDENT_REM)}rem`,
      }}
      tabIndex={-1}
    >
      <Checkbox
        aria-hidden="true"
        checked={checked}
        className="pointer-events-none"
        tabIndex={-1}
      />
      <span className="min-w-0 grow truncate">{data?.name ?? item.label}</span>
      {item.description === undefined ? null : (
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {item.description}
        </span>
      )}
    </div>
  );
}
