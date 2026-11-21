import { CATEGORY_PREFIX } from "./gallery-cascader.constants";

import type { PickerField } from "./gallery-cascader.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Builds the cascader's tree from fields: a branch per category, shape first,
 * holding its fields, each with its description.
 */
export function createFieldNodes(
  fields: readonly PickerField[],
): CascaderNode[] {
  const branches = new Map<string, CascaderNode[]>();

  for (const field of fields) {
    branches.set(field.category, [
      ...(branches.get(field.category) ?? []),
      {
        description: field.description,
        keywords: [field.key, field.label],
        label: field.label,
        value: field.key,
      },
    ]);
  }

  return [...branches]
    .toSorted(([left], [right]) =>
      rankCategory(left).localeCompare(rankCategory(right)),
    )
    .map(([category, children]): CascaderNode => ({
      children,
      label: humanizeCategory(category),
      value: `${CATEGORY_PREFIX}${category}`,
    }));
}

/**
 * Words a category as a person reads it: its first letter raised, dashes and underscores spaced.
 */
export function humanizeCategory(category: string): string {
  const spaced = category.replaceAll(/[-_]+/gu, " ");

  return `${spaced.charAt(0).toUpperCase()}${spaced.slice(1)}`;
}

/**
 * Orders a category: the shape fields first, then the catalog's by name.
 */
function rankCategory(category: string): string {
  return category === "shape" ? "" : category;
}
