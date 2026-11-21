import { useState } from "react";

import { countEntries } from "../gallery-filter-builder/filter-limits.utilities";
import { GalleryFilterBuilder } from "../gallery-filter-builder/gallery-filter-builder";
import {
  DEFAULT_ROWS_FILTER,
  EMPTY_FILTER_GROUP,
  filterCombinatorSchema,
  MAXIMUM_FILTER_ENTRIES,
} from "../gallery-filter-builder/gallery-filter-builder.constants";
import {
  addNode,
  countRules,
  setCombinator,
} from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterPillRow } from "./components/filter-pill-row/filter-pill-row";
import { FilterSurface } from "./components/filter-surface/filter-surface";

import type {
  FilterEdit,
  FilterField,
  FilterGroup,
  FilterRule,
  RowsFilter,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The attributes, tree, rows rule, and edits.
 */
export interface GalleryFiltersProperties {
  className?: string;
  fields: readonly FilterField[];
  filter: FilterGroup | undefined;
  /** Called to reset the tree to none and the rows rule to its default. */
  onClear: () => void;
  /** Called with the whole tree after every edit, none once it is empty. */
  onFilterChange: (filter?: FilterGroup) => void;
  /** Called with the rows rule after every edit of it. */
  onRowsChange: (rows: RowsFilter) => void;
  /** The rows rule every filter holds, which cannot be removed. */
  rows: RowsFilter;
}

// 🧩 Component

/**
 * Renders the Filter button and popup, a Match select, Clear, and a pill for each filter.
 */
export function GalleryFilters(
  properties: Readonly<GalleryFiltersProperties>,
): ReactNode {
  const {
    className,
    fields,
    filter,
    onClear,
    onFilterChange,
    onRowsChange,
    rows,
  } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup
  const root = filter ?? EMPTY_FILTER_GROUP;
  const activeCount = countRules(root);
  const isDefault =
    activeCount === 0 &&
    JSON.stringify(rows) === JSON.stringify(DEFAULT_ROWS_FILTER);

  // 💪 Handlers
  const handleEdit = (edit: FilterEdit): void => {
    const next = edit(root);

    onFilterChange(next.rules.length === 0 ? undefined : next);
  };
  const handleAdd = (rule: FilterRule): void => {
    handleEdit(addNode([], rule));
    setIsOpen(false);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-filters"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSurface
            activeCount={activeCount}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
          >
            <GalleryFilterBuilder
              fields={fields}
              isFull={countEntries(root) >= MAXIMUM_FILTER_ENTRIES}
              onAdd={handleAdd}
            />
          </FilterSurface>
          {root.rules.length > 1 && (
            <select
              aria-label="Match"
              className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1 text-sm"
              onChange={(event) => {
                handleEdit(
                  setCombinator(
                    [],
                    filterCombinatorSchema.parse(event.target.value),
                  ),
                );
              }}
              title="Rows always applies, whichever you pick"
              value={root.combinator}
            >
              <option value="and">Match all</option>
              <option value="or">Match any</option>
            </select>
          )}
          <button
            className="rounded-md border border-(--line) px-3 py-1 text-sm disabled:opacity-50"
            disabled={isDefault}
            onClick={onClear}
            type="button"
          >
            Clear
          </button>
        </div>
        <FilterPillRow
          fields={fields}
          filter={filter}
          onEdit={handleEdit}
          onRowsChange={onRowsChange}
          rows={rows}
        />
      </div>
    </div>
  );
}
