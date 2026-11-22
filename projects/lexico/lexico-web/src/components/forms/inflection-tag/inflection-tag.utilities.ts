import { CATEGORY_VARIANTS, TAGS } from "./inflection-tag.constants";

import type { TagDescription } from "./inflection-tag.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Describes a grammatical value such as "nominative": its short label, its spoken name, and its category's badge color. A value without a short form shows as written, outlined.
 */
export function describeTag(value: string): TagDescription {
  const name = value.replaceAll(/([A-Z])/gu, " $1").toLowerCase();
  const tag = TAGS[value];

  return tag === undefined
    ? { label: value, name, variant: "outline" }
    : { label: tag.label, name, variant: CATEGORY_VARIANTS[tag.category] };
}
