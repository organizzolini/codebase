import { useViewportWidth } from "../../hooks/use-viewport-width/use-viewport-width";
import { GalleryFilterBuilder } from "../gallery-filter-builder/gallery-filter-builder";
import { DEFAULT_ROWS_FILTER } from "../gallery-filter-builder/gallery-filter-builder.constants";
import { countRules } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterChipRow } from "./filter-chip-row";
import { FilterSurface } from "./filter-surface";
import { pickFilterSurface } from "./gallery-filters.utilities";

import type {
  FilterField,
  FilterGroup,
  RowsFilter,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields to pick from, the filter tree, and the edit handler.
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
 * Renders the Filters button, a Clear button resetting rows to its default, and the chips.
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
  const { width } = useViewportWidth();

  // 🏗 Setup
  const activeCount = filter === undefined ? 0 : countRules(filter);
  const isDefault =
    activeCount === 0 &&
    JSON.stringify(rows) === JSON.stringify(DEFAULT_ROWS_FILTER);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-filters"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FilterSurface
          activeCount={activeCount}
          kind={pickFilterSurface(width)}
        >
          <GalleryFilterBuilder
            fields={fields}
            filter={filter}
            onFilterChange={onFilterChange}
            onRowsChange={onRowsChange}
            rows={rows}
          />
        </FilterSurface>
        <button
          className="rounded-md border border-(--line) px-3 py-1 text-sm disabled:opacity-50"
          disabled={isDefault}
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
        <FilterChipRow
          fields={fields}
          filter={filter}
          onFilterChange={onFilterChange}
          rows={rows}
        />
      </div>
    </div>
  );
}
