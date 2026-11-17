import { useState } from "react";

import { Button, Input, Label } from "@codebase/presentation";

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
 * The library's search box. The route keys it by the search it shows, so a
 * change of URL starts the box over from that search.
 */
export function LibrarySearch(
  properties: Readonly<LibrarySearchProperties>,
): ReactNode {
  const { className, onSearch, search } = properties;

  // 🪝 Hooks
  const [draft, setDraft] = useState(search);

  // 🏗 Setup

  // 💪 Handlers
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(draft.trim());
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-search"
    >
      <form
        className="flex items-center gap-2"
        onSubmit={handleSubmit}
        role="search"
      >
        <Label
          className="sr-only"
          htmlFor="library-search"
        >
          Search the library
        </Label>
        <Input
          className="min-w-0 flex-1"
          id="library-search"
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          placeholder="Author, title, collection, province…"
          type="search"
          value={draft}
        />
        <Button type="submit">Search</Button>
      </form>
    </div>
  );
}
