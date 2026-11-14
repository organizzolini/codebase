import { useViewportWidth } from "../../hooks/use-viewport-width/use-viewport-width";
import { GalleryFilterBuilder } from "../gallery-filter-builder/gallery-filter-builder";
import { countRules } from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterChipRow } from "./filter-chip-row";
import { FilterSurface } from "./filter-surface";
import { pickFilterSurface } from "./gallery-filters.utilities";

import type {
  FilterField,
  FilterGroup,
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
  /** Called with the whole tree after every edit, none once it is empty. */
  onFilterChange: (filter?: FilterGroup) => void;
}

// 🧩 Component

/**
 * Renders the Filters button, which opens the builder where the window's
 * width suits, a Clear button, and a chip for each rule in force.
 */
export function GalleryFilters(
  properties: Readonly<GalleryFiltersProperties>,
): ReactNode {
  const { className, fields, filter, onFilterChange } = properties;

  // 🪝 Hooks
  const { width } = useViewportWidth();

  // 🏗 Setup
  const activeCount = filter === undefined ? 0 : countRules(filter);

  // 💪 Handlers
  const handleClear = (): void => {
    onFilterChange();
  };

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
          />
        </FilterSurface>
        <button
          className="rounded-md border border-(--line) px-3 py-1 text-sm disabled:opacity-50"
          disabled={activeCount === 0}
          onClick={handleClear}
          type="button"
        >
          Clear
        </button>
        <FilterChipRow
          fields={fields}
          filter={filter}
          onFilterChange={onFilterChange}
        />
      </div>
    </div>
  );
}
