import { useState } from "react";

import {
  ensureRequiredRules,
  fromFilterQuery,
  isSameFilterLink,
  toFilterQuery,
} from "../../components/gallery/gallery-filters/components/filter-query/filter-query.utilities";

import type { FilterField } from "../../components/gallery/gallery-filters/components/filter-model/filter-model.types";
import type {
  FilterLink,
  GalleryFilterQuery,
} from "../../components/gallery/gallery-filters/components/filter-query/filter-query.types";
import type { UseFilterQueryResult } from "./use-filter-query.types";

// 🧩 Hook

/**
 * Holds the Filters tree the link stands for, and writes the link once an edit changes it.
 */
export function useFilterQuery(
  link: FilterLink,
  fields: readonly FilterField[],
  onLinkChange: (link: FilterLink) => void,
): UseFilterQueryResult {
  // 🪝 Hooks
  const [query, setQuery] = useState(() => toFilterQuery(link, fields));
  const [seenLink, setSeenLink] = useState(link);

  // 🏗 Setup
  if (!isSameFilterLink(link, seenLink)) {
    setSeenLink(link);

    if (!isSameFilterLink(link, fromFilterQuery(query, fields))) {
      setQuery(toFilterQuery(link, fields));
    }
  }

  // 💪 Handlers
  const handleQueryChange = (next: GalleryFilterQuery): void => {
    // A clear in the builder leaves neither required rule; they come back.
    const settled = ensureRequiredRules(next);
    const nextLink = fromFilterQuery(settled, fields);

    setQuery(settled);

    if (!isSameFilterLink(nextLink, fromFilterQuery(query, fields))) {
      onLinkChange(nextLink);
    }
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return { handleQueryChange, query };
}
