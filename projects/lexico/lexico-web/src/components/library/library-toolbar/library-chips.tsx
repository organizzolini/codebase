import { Button, FilterChip } from "@codebase/presentation";

import { LibrarySortChip } from "../library-sort/library-sort-chip";

import type {
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";
import type { FilterRule } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The filter rules and sort to show as chips, and what to call to change the sort or reset.
 */
export interface LibraryChipsProperties {
  className?: string;
  direction?: LibrarySortDirection | undefined;
  onReset: () => void;
  onSort: (sort?: LibrarySortField, direction?: LibrarySortDirection) => void;
  rules: FilterRule[];
  sort?: LibrarySortField | undefined;
}

// 🧩 Component

/**
 * A chip for each active filter and sort, with Reset. It belongs inside the toolbar's Filters.
 */
export function LibraryChips(
  properties: Readonly<LibraryChipsProperties>,
): ReactNode {
  const { className, direction, onReset, onSort, rules, sort } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-chips"
    >
      <div className="flex flex-wrap items-center gap-2">
        {rules.map((rule, index) => (
          <FilterChip
            key={rule.id}
            index={index}
            rule={rule}
          />
        ))}
        {sort === undefined ? null : (
          <LibrarySortChip
            direction={direction}
            onSort={onSort}
            sort={sort}
          />
        )}
        <Button
          onClick={() => {
            onReset();
          }}
          type="button"
          variant="ghost"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
