import { ListFilter } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  FilterChip,
  Filters,
  FiltersBuilder,
  flattenFilterRules,
} from "@codebase/presentation";

import { LibrarySearch } from "../library-search/library-search";
import { LibrarySort } from "../library-sort/library-sort";
import { LibrarySortChip } from "../library-sort/library-sort-chip";

import { FILTER_BUTTON_LABEL } from "./library-toolbar.constants";
import {
  createLibraryFilterFields,
  isSameFilters,
  toFilterParameters,
  toFilterQuery,
} from "./library-toolbar.utilities";

import type {
  LibrarySortDirection,
  LibrarySortField,
} from "../../graphql/generated/operations";
import type { LibraryFilterParameters } from "../library-grid/library-grid.types";
import type { LibraryFacetsResult } from "./library-toolbar.types";
import type { FilterQuery } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The facets to offer, the URL's filters, sort, and search, and what to call when each changes.
 */
export interface LibraryToolbarProperties {
  className?: string;
  direction?: LibrarySortDirection | undefined;
  facets: LibraryFacetsResult;
  filters: LibraryFilterParameters;
  onFilters: (filters: LibraryFilterParameters) => void;
  onReset: () => void;
  onSearch: (search: string) => void;
  onSort: (sort?: LibrarySortField, direction?: LibrarySortDirection) => void;
  search: string;
  sort?: LibrarySortField | undefined;
}

// 🧩 Component

/**
 * One row of search, Filter menu, and Sort menu, with chips for each active filter and sort beneath. Edits apply at once.
 */
export function LibraryToolbar(
  properties: Readonly<LibraryToolbarProperties>,
): ReactNode {
  const {
    className,
    direction,
    facets,
    filters,
    onFilters,
    onReset,
    onSearch,
    onSort,
    search,
    sort,
  } = properties;

  // 🪝 Hooks
  const [query, setQuery] = useState(() => toFilterQuery(filters));
  const [seenFilters, setSeenFilters] = useState(filters);

  // 🏗 Setup
  // The URL leads: a change it did not come from, such as Back, replaces the
  // chips, while a chip still missing its value stays until it is filled.
  if (!isSameFilters(filters, seenFilters)) {
    setSeenFilters(filters);
    if (!isSameFilters(filters, toFilterParameters(query))) {
      setQuery(toFilterQuery(filters));
    }
  }
  const rules = flattenFilterRules(query);
  const used = new Set(rules.map((rule) => rule.path[0] ?? ""));
  const fields = createLibraryFilterFields(facets, used);
  const isActive = rules.length > 0 || sort !== undefined;

  // 💪 Handlers
  const handleQueryChange = (next: FilterQuery): void => {
    setQuery(next);
    const nextFilters = toFilterParameters(next);
    if (!isSameFilters(nextFilters, toFilterParameters(query))) {
      onFilters(nextFilters);
    }
  };
  const handleReset = (): void => {
    setQuery(toFilterQuery({}));
    onReset();
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-toolbar"
    >
      <Filters
        fields={fields}
        onQueryChange={handleQueryChange}
        query={query}
      >
        <div className="flex flex-wrap items-center gap-2">
          <LibrarySearch
            key={search}
            className="min-w-64 flex-1"
            onSearch={onSearch}
            search={search}
          />
          <FiltersBuilder
            trigger={
              <Button
                type="button"
                variant="outline"
              >
                <ListFilter aria-hidden="true" />
                {FILTER_BUTTON_LABEL}
                {rules.length === 0 ? null : (
                  <Badge
                    aria-hidden="true"
                    className="tabular-nums"
                    variant="secondary"
                  >
                    {rules.length}
                  </Badge>
                )}
              </Button>
            }
          />
          <LibrarySort
            direction={direction}
            onSort={onSort}
            sort={sort}
          />
        </div>
        {isActive ? (
          <div
            className="mt-3 flex flex-wrap items-center gap-2"
            data-testid="library-chips"
          >
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
              onClick={handleReset}
              type="button"
              variant="ghost"
            >
              Reset
            </Button>
          </div>
        ) : null}
      </Filters>
    </div>
  );
}
