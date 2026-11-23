import type { CascaderNode } from "@codebase/presentation";

// ♟️ Constants

/**
 * What each layout is called.
 */
export const LAYOUT_NAMES = { grid: "Grid", list: "List" } as const;

/**
 * The layouts as the cascader lists them, each with its description.
 */
export const LAYOUT_NODES: CascaderNode[] = [
  {
    description: "Cards in a grid, several to a row",
    label: LAYOUT_NAMES.grid,
    value: "grid",
  },
  {
    description: "Cards in a list, one to a row",
    label: LAYOUT_NAMES.list,
    value: "list",
  },
];
