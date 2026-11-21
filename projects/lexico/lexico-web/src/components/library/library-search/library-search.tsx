import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
} from "@codebase/presentation";

import { SEARCH_DEBOUNCE_MILLISECONDS } from "../../search/search-bar/search-bar.constants";
import { debounce } from "../../search/search-bar/search-bar.utilities";

import type { ReactNode, SubmitEvent } from "react";

// 🔖 Type

/**
 * Properties for the LibrarySearch component.
 */
export interface LibrarySearchProperties {
  className?: string;
  onSearch: (search: string) => void;
  search: string;
}

// 🧩 Component

/**
 * The library's search box. It searches as you type, once typing pauses, and
 * at once on Enter. A search that arrives from the URL replaces the draft.
 */
export function LibrarySearch(
  properties: Readonly<LibrarySearchProperties>,
): ReactNode {
  const { className, onSearch, search } = properties;

  // 🪝 Hooks
  const [draft, setDraft] = useState(search);
  const [seenSearch, setSeenSearch] = useState(search);
  const [sentSearch, setSentSearch] = useState(search);

  // 🏗 Setup
  // The URL leads: a search this box did not send, such as Back or Clear,
  // replaces the draft, while the echo of one it sent leaves it alone.
  if (search !== seenSearch) {
    setSeenSearch(search);
    if (search !== sentSearch) {
      setSentSearch(search);
      setDraft(search);
    }
  }
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSentSearch(value.trim());
        onSearch(value.trim());
      }, SEARCH_DEBOUNCE_MILLISECONDS),
    [onSearch],
  );

  // 💪 Handlers
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    debouncedSearch.cancel();
    setSentSearch(draft.trim());
    onSearch(draft.trim());
  };

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
      data-testid="library-search"
    >
      <form
        onSubmit={handleSubmit}
        role="search"
      >
        <Label
          className="sr-only"
          htmlFor="library-search"
        >
          Search the library
        </Label>
        <InputGroup className="bg-card dark:bg-card">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id="library-search"
            onChange={(event) => {
              setDraft(event.currentTarget.value);
              debouncedSearch(event.currentTarget.value);
            }}
            placeholder="Author, title, province…"
            type="search"
            value={draft}
          />
        </InputGroup>
      </form>
    </div>
  );
}
