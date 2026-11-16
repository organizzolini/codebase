import { Label } from "@codebase/presentation";

import { LibrarySortDirection } from "../../graphql/generated/operations";

import {
  LIBRARY_SORT_DIRECTIONS,
  LIBRARY_SORT_FIELDS,
  LIBRARY_SORT_OPTIONS,
} from "./library-sort.constants";

import type { LibrarySortField } from "../../graphql/generated/operations";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibrarySort component.
 */
export interface LibrarySortProperties {
  className?: string;
  direction?: LibrarySortDirection | undefined;
  onSort: (
    sort: LibrarySortField | undefined,
    direction: LibrarySortDirection | undefined,
  ) => void;
  sort?: LibrarySortField | undefined;
}

// 🧩 Component

/**
 * The library's sort control: an attribute to order by and a direction. The
 * URL owns both, so the selects only report a change.
 */
export function LibrarySort(
  properties: Readonly<LibrarySortProperties>,
): ReactNode {
  const { className, direction, onSort, sort } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleField = (value: string): void => {
    onSort(LIBRARY_SORT_FIELDS.get(value), direction);
  };
  const handleDirection = (value: string): void => {
    onSort(sort, LIBRARY_SORT_DIRECTIONS.get(value));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-sort"
    >
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="library-sort-field">Sort by</Label>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            id="library-sort-field"
            onChange={(event) => {
              handleField(event.target.value);
            }}
            value={sort ?? ""}
          >
            <option value="">Default order</option>
            {LIBRARY_SORT_OPTIONS.map((option) => (
              <option
                key={option.field}
                value={option.field}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="library-sort-direction">Direction</Label>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            disabled={sort === undefined}
            id="library-sort-direction"
            onChange={(event) => {
              handleDirection(event.target.value);
            }}
            value={direction ?? LibrarySortDirection.Asc}
          >
            <option value={LibrarySortDirection.Asc}>Ascending</option>
            <option value={LibrarySortDirection.Desc}>Descending</option>
          </select>
        </div>
      </div>
    </div>
  );
}
