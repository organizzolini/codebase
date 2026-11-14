import { FilterGroupEditor } from "./filter-group-editor";
import { countEntries } from "./filter-limits.utilities";
import {
  EMPTY_FILTER_GROUP,
  MAXIMUM_FILTER_ENTRIES,
} from "./gallery-filter-builder.constants";

import type {
  FilterEdit,
  FilterField,
  FilterGroup,
} from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields to pick from, the filter tree, and the edit handler.
 */
export interface GalleryFilterBuilderProperties {
  className?: string;
  fields: readonly FilterField[];
  filter: FilterGroup | undefined;
  /** Called with the whole tree after every edit, none once it is empty. */
  onFilterChange: (filter: FilterGroup | undefined) => void;
}

// 🧩 Component

/**
 * Renders the rule tree builder: AND and OR groups of rules, nested, each
 * rule a field, an operator and a value.
 */
export function GalleryFilterBuilder(
  properties: Readonly<GalleryFilterBuilderProperties>,
): ReactNode {
  const { className, fields, filter, onFilterChange } = properties;

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
