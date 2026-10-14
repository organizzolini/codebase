import lodash from "lodash";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Spinner,
} from "@codebase/components-web";

import type { ReactNode, SyntheticEvent } from "react";

// ♟️ Constants

/**
 * How long typing must pause before the query is searched, in milliseconds.
 */
const SEARCH_DEBOUNCE_MILLISECONDS = 300;

// 🔖 Type

/**
 * The properties SearchBar accepts.
 */
export interface SearchBarProperties {
  className?: string;
  initialQuery?: string;
  isLoading?: boolean;
  onSearch: (query: string) => void;
}

// 🧩 Component

/**
 * The search field. It searches as you type, once typing pauses, and at once
 * when the form is submitted.
 */
export function SearchBar(
  properties: Readonly<SearchBarProperties>,
): ReactNode {
  const {
    className,
    initialQuery = "",
    isLoading = false,
    onSearch,
  } = properties;

  // 🪝 Hooks
  const [query, setQuery] = useState(initialQuery);

  // 🏗 Setup
  const debouncedSearch = useMemo(
    () => lodash.debounce(onSearch, SEARCH_DEBOUNCE_MILLISECONDS),
    [onSearch],
  );

  // 💪 Handlers
  /**
   * Searches at once, without waiting for typing to pause.
   */
  function handleSubmit(event: SyntheticEvent): void {
    event.preventDefault();
    debouncedSearch.cancel();
    onSearch(query);
  }

  // ♻️ Lifecycle
  useEffect(
    () => () => {
      debouncedSearch.cancel();
    },
    [debouncedSearch],
  );

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="search-bar"
    >
      <form
        className="mx-auto w-full max-w-xl"
        onSubmit={handleSubmit}
        role="search"
      >
        <InputGroup className="h-12">
          <InputGroupInput
            aria-label="Search Lexico"
            className="text-lg"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              debouncedSearch(event.currentTarget.value);
            }}
            placeholder="Search Lexico"
            type="search"
            value={query}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Search"
              size="icon-sm"
              type="submit"
            >
              {isLoading ? <Spinner /> : <Search />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
