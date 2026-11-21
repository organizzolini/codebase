import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

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
