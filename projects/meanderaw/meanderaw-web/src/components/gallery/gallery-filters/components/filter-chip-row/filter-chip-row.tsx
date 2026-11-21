import {
  FilterChip,
  flattenFilterRules,
  useFilterState,
} from "@codebase/presentation";

import type { GalleryFilterValue } from "../filter-query/filter-query.types";
import type { ReactNode } from "react";

// 🧩 Component

/**
 * Draws a chip for each rule of the tree, nested ones too, as children of the surrounding button group.
 */
export function FilterChipRow(): ReactNode {
  // 🪝 Hooks
  const { query } = useFilterState<GalleryFilterValue>();

  // 🏗 Setup
  const rules = flattenFilterRules(query);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (rules.length === 0) {
    return null;
  }

  // 🎨 Markup
  return rules.map((rule, index) => (
    <FilterChip
      key={rule.id}
      index={index}
      rule={rule}
    />
  ));
}
