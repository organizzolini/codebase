import { useMemo } from "react";

import { ButtonGroup, Filters, FiltersBuilder } from "@codebase/presentation";

import { useFilterQuery } from "../../../hooks/use-filter-query/use-filter-query";

import { FilterChipRow } from "./components/filter-chip-row/filter-chip-row";
import { createFilterQueryFields } from "./components/filter-query/filter-fields.utilities";
import {
  countActiveRules,
  isQueryAllowed,
} from "./components/filter-query/filter-query.utilities";
import { FILTERS_TITLE, STRIP_CLASS_NAME } from "./gallery-filters.constants";
import { renderFiltersButton } from "./gallery-filters.utilities";

import type { FilterField } from "./components/filter-model/filter-model.types";
import type {
  FilterLink,
  GalleryFilterQuery,
  GalleryFilterValue,
} from "./components/filter-query/filter-query.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields, the link, and its change handler.
 */
export interface GalleryFiltersProperties {
  className?: string;
  fields: readonly FilterField[];
  link: FilterLink;
  /** Called with what the link holds, whenever an edit changes it. */
  onLinkChange: (link: FilterLink) => void;
}

// 🧩 Component

/**
 * Renders one button group: the Filter button, whose popover picks an attribute, and a chip for each rule, edited in its own popover.
 */
export function GalleryFilters(
  properties: Readonly<GalleryFiltersProperties>,
): ReactNode {
  const { className, fields, link, onLinkChange } = properties;

  // 🪝 Hooks
  const { handleQueryChange, query } = useFilterQuery(
    link,
    fields,
    onLinkChange,
  );
  const queryFields = useMemo(() => createFilterQueryFields(fields), [fields]);

  // 🏗 Setup
  const activeCount = countActiveRules(query, fields);

  // 💪 Handlers
  const handleBeforeChange = (next: GalleryFilterQuery): boolean =>
    isQueryAllowed(next, fields);

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-filters"
    >
      <Filters<GalleryFilterValue>
        fields={queryFields}
        onBeforeQueryChange={handleBeforeChange}
        onQueryChange={handleQueryChange}
        query={query}
        size="sm"
      >
        <ButtonGroup
          aria-label={FILTERS_TITLE}
          className={STRIP_CLASS_NAME}
        >
          <FiltersBuilder trigger={renderFiltersButton(activeCount)} />
          <FilterChipRow />
        </ButtonGroup>
      </Filters>
    </div>
  );
}
