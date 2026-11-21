import { ListFilter } from "lucide-react";
import { useState } from "react";

import {
  Button,
  ButtonGroup,
  FilterChip,
  Filters,
  FiltersBuilder,
  flattenFilterRules,
} from "@codebase/presentation";

import { LibraryGroup } from "../library-group/library-group";
import { LibraryPaging } from "../library-paging/library-paging";
import { LibrarySearch } from "../library-search/library-search";
import { LibrarySort } from "../library-sort/library-sort";

import { FILTER_BUTTON_LABEL } from "./library-toolbar.constants";
import {
  createLibraryFilterFields,
  isSameFilters,
  toFilterParameters,
  toFilterQuery,
} from "./library-toolbar.utilities";

import type { LibraryGroupField } from "../../../graphql/generated/operations";
import type { LibraryFilterParameters } from "../library-grid/library-grid.types";
import type { LibrarySortEntry } from "../library-sort/library-sort.types";
import type { LibraryFacetsResult } from "./library-toolbar.types";
import type { FilterQuery } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The facets to offer, the URL's filters, groups, sort, search, and paging, and what to call when each changes.
 */
export interface LibraryToolbarProperties {
  className?: string;
  facets: LibraryFacetsResult;
  filters: LibraryFilterParameters;
  groups?: readonly LibraryGroupField[] | undefined;
  limit: number;
  onFilters: (filters: LibraryFilterParameters) => void;
  onGroups: (groups: LibraryGroupField[]) => void;
  onLimit: (limit: number) => void;
  onPage: (page: number) => void;
  onSearch: (search: string) => void;
  onSorts: (sorts: LibrarySortEntry[]) => void;
  page: number;
  pageCount: number;
  search: string;
  sorts?: readonly LibrarySortEntry[] | undefined;
  /** How many authors the library holds in all. */
  totalCount: number;
}

// 🧩 Component

/**
 * A search box over a wrapping row of Group, Sort, Filter, and Page strips. Each active group, sort, and filter is a segment joined to its button, and the Page strip steps through the range on view. Edits apply at once.
 */
export function LibraryToolbar(
  properties: Readonly<LibraryToolbarProperties>,
): ReactNode {
  const {
    className,
    facets,
    filters,
    groups = [],
    limit,
    onFilters,
    onGroups,
    onLimit,
    onPage,
    onSearch,
    onSorts,
    page,
    pageCount,
    search,
    sorts = [],
    totalCount,
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

  // 💪 Handlers
  const handleQueryChange = (next: FilterQuery): void => {
    setQuery(next);
    const nextFilters = toFilterParameters(next);
    if (!isSameFilters(nextFilters, toFilterParameters(query))) {
      onFilters(nextFilters);
    }
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
        <div className="flex flex-col gap-2">
          <LibrarySearch
            onSearch={onSearch}
            search={search}
          />
          <div className="flex flex-wrap items-center gap-2">
            <LibraryGroup
              groups={groups}
              onGroups={onGroups}
            />
            <LibrarySort
              onSorts={onSorts}
              sorts={sorts}
            />
            <ButtonGroup className="[&>[data-slot=filter-chip]>:first-child]:rounded-l-none [&>[data-slot=filter-chip]>:first-child]:border-l-0">
              <FiltersBuilder
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                  >
                    <ListFilter aria-hidden="true" />
                    {FILTER_BUTTON_LABEL}
                  </Button>
                }
              />
              {rules.map((rule, index) => (
                <FilterChip
                  key={rule.id}
                  index={index}
                  rule={rule}
                />
              ))}
            </ButtonGroup>
            <LibraryPaging
              limit={limit}
              onLimit={onLimit}
              onPage={onPage}
              page={page}
              pageCount={pageCount}
              totalCount={totalCount}
            />
          </div>
        </div>
      </Filters>
    </div>
  );
}
