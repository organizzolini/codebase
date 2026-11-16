import { FilterGroupEditor } from "./filter-group-editor";
import { countEntries } from "./filter-limits.utilities";
import { FilterRowsEditor } from "./filter-rows-editor";
import {
  EMPTY_FILTER_GROUP,
  MAXIMUM_FILTER_ENTRIES,
} from "./gallery-filter-builder.constants";

import type {
  FilterEdit,
  FilterField,
  FilterGroup,
  RowsFilter,
} from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields, the filter tree, the rows rule, and the edit handlers.
 */
export interface GalleryFilterBuilderProperties {
  className?: string;
  fields: readonly FilterField[];
  filter: FilterGroup | undefined;
  /** Called with the whole tree after every edit, none once it is empty. */
  onFilterChange: (filter: FilterGroup | undefined) => void;
  onRowsChange: (rows: RowsFilter) => void;
  /** The rows rule every filter holds, which cannot be removed. */
  rows: RowsFilter;
}

// 🧩 Component

/**
 * Renders the required rows rule above the rule tree builder: nested AND/OR groups of rules.
 */
export function GalleryFilterBuilder(
  properties: Readonly<GalleryFilterBuilderProperties>,
): ReactNode {
  const { className, fields, filter, onFilterChange, onRowsChange, rows } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const root = filter ?? EMPTY_FILTER_GROUP;

  // 💪 Handlers
  const handleEdit = (edit: FilterEdit): void => {
    const next = edit(root);

    onFilterChange(next.rules.length === 0 ? undefined : next);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-filter-builder"
    >
      <FilterRowsEditor
        onRowsChange={onRowsChange}
        rows={rows}
      />
      <FilterGroupEditor
        fields={fields}
        group={root}
        isFull={countEntries(root) >= MAXIMUM_FILTER_ENTRIES}
        onEdit={handleEdit}
        path={[]}
      />
    </div>
  );
}
