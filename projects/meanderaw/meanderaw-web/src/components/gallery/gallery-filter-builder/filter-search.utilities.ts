import { FIELD_SEARCH_LIMIT } from "./gallery-filter-builder.constants";

import type {
  FilterField,
  FilterFieldGroup,
  FilterSearchResult,
} from "./gallery-filter-builder.types";

// 🔏 Private Functions

/**
 * Finds the fields holding every word typed, at most a limit, grouped by category, shape first.
 */
export function searchFields(
  fields: readonly FilterField[],
  query: string,
  limit = FIELD_SEARCH_LIMIT,
): FilterSearchResult {
  const words = query.toLowerCase().split(/\s+/u).filter(Boolean);
  const matches: FilterField[] = [];

  for (const field of fields) {
    const text =
      `${field.label} ${field.key} ${field.description} ${field.category}`.toLowerCase();

    if (words.every((word) => text.includes(word))) {
      matches.push(field);
    }
  }

  const ordered = matches.toSorted((left, right) =>
    rankCategory(left.category).localeCompare(rankCategory(right.category)),
  );
  const groups: FilterFieldGroup[] = [];

  for (const field of ordered.slice(0, limit)) {
    const last = groups.at(-1);

    if (last?.category === field.category) {
      last.fields.push(field);
    } else {
      groups.push({ category: field.category, fields: [field] });
    }
  }

  return { groups, total: matches.length };
}

// 🌎 Public Functions

/**
 * Ranks a category: shape fields first, then the catalog's by name.
 */
function rankCategory(category: string): string {
  return category === "shape" ? "" : category;
}
