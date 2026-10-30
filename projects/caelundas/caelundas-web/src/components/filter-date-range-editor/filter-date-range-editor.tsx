import { Button, Input } from "@codebase/presentation";

import type { FilterEditorProps } from "@codebase/presentation";
import type { KeyboardEvent, ReactNode } from "react";

// 🔖 Type

/**
 * What the filter builder hands every value editor. Its value is read as the
 * calendar's own, a pair of days, whatever the registry's type says.
 */
export interface FilterDateRangeEditorProperties extends FilterEditorProps {
  className?: string;
}

// 🧩 Component

/**
 * Renders the date field's value editor: a first and a last day, as the
 * `YYYY-MM-DD` pair the filter compiler reads in the observer's zone. Enter
 * or Apply commits the pair and Escape cancels; the builder flags a pair
 * that is missing a day or runs backwards.
 */
export function FilterDateRangeEditor(
  properties: Readonly<FilterDateRangeEditorProperties>,
): ReactNode {
  const {
    autoFocusProps,
    cancel,
    className,
    commit,
    field,
    labels,
    onValueChange,
    value,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const days: readonly unknown[] = Array.isArray(value) ? value : [];
  const from = typeof days[0] === "string" ? days[0] : "";
  const to = typeof days[1] === "string" ? days[1] : "";

  // 💪 Handlers
  const handleChange = (index: 0 | 1, day: string): void => {
    const next: (null | string)[] = [
      from === "" ? null : from,
      to === "" ? null : to,
    ];

    next[index] = day === "" ? null : day;
    onValueChange(next);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-date-range-editor"
    >
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-1.5">
          <Input
            {...autoFocusProps}
            aria-label={labels.rangeFrom(field.label)}
            onChange={(event) => {
              handleChange(0, event.target.value);
            }}
            onKeyDown={handleKeyDown}
            type="date"
            value={from}
          />
          <span className="text-muted-foreground text-xs">
            {labels.rangeSeparator}
          </span>
          <Input
            aria-label={labels.rangeTo(field.label)}
            onChange={(event) => {
              handleChange(1, event.target.value);
            }}
            onKeyDown={handleKeyDown}
            type="date"
            value={to}
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              commit();
            }}
            size="sm"
          >
            {labels.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}
