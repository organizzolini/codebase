import { ListFilter } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Filters,
  FiltersBuilder,
  flattenFilterRules,
} from "@codebase/presentation";

import { LibraryPaging } from "../library-paging/library-paging";
import { LibrarySearch } from "../library-search/library-search";
import { LibrarySort } from "../library-sort/library-sort";

import { LibraryChips } from "./library-chips";
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
} from "../../../graphql/generated/operations";
import type { LibraryFilterParameters } from "../library-grid/library-grid.types";
import type { LibraryFacetsResult } from "./library-toolbar.types";
import type { FilterQuery } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The facets to offer, the URL's filters, sort, search, and paging, and what to call when each changes.
 */
export interface LibraryToolbarProperties {
  className?: string;
  direction?: LibrarySortDirection | undefined;
  facets: LibraryFacetsResult;
  filters: LibraryFilterParameters;
  limit: number;
  onFilters: (filters: LibraryFilterParameters) => void;
  onLimit: (limit: number) => void;
  onPage: (page: number) => void;
  onReset: () => void;
  onSearch: (search: string) => void;
  onSort: (sort?: LibrarySortField, direction?: LibrarySortDirection) => void;
  page: number;
  pageCount: number;
  search: string;
  sort?: LibrarySortField | undefined;
}

// 🧩 Component

/**
 * One row of search, Filter, Sort, and Page menus, with chips for each active filter and sort beneath. Edits apply at once.
 */
export function LibraryToolbar(
  properties: Readonly<LibraryToolbarProperties>,
): ReactNode {
  const {
    className,
    direction,
    facets,
    filters,
    limit,
    onFilters,
    onLimit,
    onPage,
    onReset,
    onSearch,
    onSort,
    page,
    pageCount,
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
            className="min-w-64 flex-1"
            onSearch={onSearch}
            search={search}
          />
          <FiltersBuilder
            trigger={
              <Button
                className="bg-card hover:bg-muted dark:bg-card dark:hover:bg-muted"
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
          <LibraryPaging
            limit={limit}
            onLimit={onLimit}
            onPage={onPage}
            page={page}
            pageCount={pageCount}
          />
        </div>
        {isActive ? (
          <LibraryChips
            className="mt-3"
            direction={direction}
            onReset={handleReset}
            onSort={onSort}
            rules={rules}
            sort={sort}
          />
        ) : null}
      </Filters>
    </div>
  );
}
