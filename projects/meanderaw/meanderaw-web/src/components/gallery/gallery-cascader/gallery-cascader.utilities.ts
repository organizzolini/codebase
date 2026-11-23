import {
  CATEGORY_PREFIX,
  LETTER_BRANCH,
  LETTER_NAME,
  MEASURE_SUFFIX,
  NESTED_CATEGORY,
  NESTING_THRESHOLD,
} from "./gallery-cascader.constants";

import type { BranchBuilder, PickerField } from "./gallery-cascader.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Builds the cascader's tree: a branch per category, shape first, with a
 * sub-category branch each in a large submatrix.
 */
export function createFieldNodes(
  fields: readonly PickerField[],
): CascaderNode[] {
  const trails = createTrails(fields);

  return nestBranches<CascaderNode>(
    fields.map((field) => ({
      leaf: {
        description: field.description,
        keywords: [field.key, field.label],
        label: field.label,
        value: field.key,
      },
      trail: trails.get(field.key) ?? [field.category],
    })),
    ({ children, id, label }): CascaderNode => ({
      children,
      label,
      value: `${CATEGORY_PREFIX}${id}`,
    }),
  );
}

/**
 * Maps each field's key to its branches, outermost first: category, then a
 * large submatrix's script and letter or noun.
 */
export function createTrails(
  fields: readonly Pick<PickerField, "category" | "key" | "label">[],
): Map<string, string[]> {
  let held = 0;

  for (const { category } of fields) {
    held += category === NESTED_CATEGORY ? 1 : 0;
  }

  const trails = new Map<string, string[]>();

  for (const { category, key, label } of fields) {
    trails.set(
      key,
      category === NESTED_CATEGORY && held > NESTING_THRESHOLD
        ? [category, ...locateSubCategory(label)]
        : [category],
    );
  }

  return trails;
}

/**
 * Words a category as a person reads it: its first letter raised, dashes and underscores spaced.
 */
export function humanizeCategory(category: string): string {
  const spaced = category.replaceAll(/[-_]+/gu, " ");

  return `${spaced.charAt(0).toUpperCase()}${spaced.slice(1)}`;
}

/**
 * Names a submatrix characteristic's sub-categories from its name: Letter,
 * script, letter; else the noun counted.
 */
export function locateSubCategory(name: string): string[] {
  const [, letter, script] = LETTER_NAME.exec(name) ?? [];

  if (letter !== undefined && script !== undefined) {
    return [LETTER_BRANCH, script, letter];
  }

  const words = name.replace(MEASURE_SUFFIX, "").split(" ");
  const noun = words.at(-1) ?? name;

  // A lone letter is a part of what it follows, like "Embedded U".
  return [noun.length === 1 ? (words.at(-2) ?? noun) : noun];
}

/**
 * Nests leaves into branches along their trails, leaves before branches.
 */
export function nestBranches<Node>(
  entries: readonly Readonly<{ leaf: Node; trail: readonly string[] }>[],
  build: BranchBuilder<Node>,
): Node[] {
  const ordered = entries.toSorted((left, right) =>
    rankTrail(left.trail).localeCompare(rankTrail(right.trail)),
  );

  return nestFrom(ordered, build, { depth: 0, parent: "" });
}

/**
 * The branch ids along a trail, then the key: a filter field's path.
 */
export function toFieldPath(trail: readonly string[], key: string): string[] {
  return [...trail.map((_, index) => trail.slice(0, index + 1).join("/")), key];
}

/**
 * Nests ordered entries from a depth of their trails down, under a parent.
 */
function nestFrom<Node>(
  entries: readonly Readonly<{ leaf: Node; trail: readonly string[] }>[],
  build: BranchBuilder<Node>,
  position: Readonly<{ depth: number; parent: string }>,
): Node[] {
  const { depth, parent } = position;
  const leaves: Node[] = [];
  const branches = new Map<string, (typeof entries)[number][]>();

  for (const entry of entries) {
    const label = entry.trail[depth];

    if (label === undefined) {
      leaves.push(entry.leaf);
    } else {
      branches.set(label, [...(branches.get(label) ?? []), entry]);
    }
  }

  const nested: Node[] = [];

  for (const [label, members] of branches) {
    const id = parent === "" ? label : `${parent}/${label}`;

    nested.push(
      build({
        children: nestFrom(members, build, { depth: depth + 1, parent: id }),
        id,
        label: depth === 0 ? humanizeCategory(label) : label,
      }),
    );
  }

  return [...leaves, ...nested];
}

/**
 * Orders a trail: by its category, shape first, then the rest of it.
 */
function rankTrail(trail: readonly string[]): string {
  const [category = "", ...rest] = trail;

  return [category === "shape" ? "" : category, ...rest].join("/");
}
