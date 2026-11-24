import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The values after a change, with the earlier ones the list does not offer kept.
 */
export function keepHiddenValues(
  next: readonly string[],
  previous: readonly string[],
  items: readonly CascaderNode[],
): string[] {
  const offered = new Set<string>();
  const pending = [...items];

  for (let item = pending.pop(); item !== undefined; item = pending.pop()) {
    offered.add(item.value);
    pending.push(...(item.children ?? []));
  }

  return [...next, ...previous.filter((value) => !offered.has(value))];
}

/**
 * Which rows can be picked: the ones named, else every row when a pick cascades beneath it, else only leaves.
 */
export function resolveSelectable(
  cascade: boolean,
  selectable: ((node: CascaderNode) => boolean) | undefined,
): "any" | "leaf" | ((node: CascaderNode) => boolean) {
  if (selectable !== undefined) {
    return selectable;
  }

  return cascade ? "any" : "leaf";
}
