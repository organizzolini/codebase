import { COUNT_COLUMN_WIDTH } from "../../calendar-timeline.constants";

import {
  CARET_WIDTH,
  CHARACTER_WIDTH,
  INDENT_WIDTH,
  MAX_TREE_SHARE,
  NAME_CHROME_WIDTH,
  PANE_GUTTER_WIDTH,
  REM_WIDTH,
  WIDTH_STEP,
} from "./timeline-tree-width.constants";

import type {
  TreeLimits,
  TreePanelBase,
  TreeWidths,
} from "./timeline-tree-width.types";
import type { GanttResource } from "@codebase/presentation";
import type { CSSProperties } from "react";

// 🌎 Public Functions

/**
 * The most the names column may take: a share of the window, less the columns beside it.
 */
export function getMaximumNameWidth(minimum: number): number {
  return Math.max(
    minimum,
    Math.floor(window.innerWidth * MAX_TREE_SHARE) -
      COUNT_COLUMN_WIDTH -
      PANE_GUTTER_WIDTH,
  );
}

/**
 * The tree panel's set widths, its names column fitted to the rows showing.
 */
export function measureTreePanel(
  resources: readonly GanttResource[],
  collapsed: readonly string[],
  panel: Readonly<TreePanelBase>,
): TreePanelBase {
  const { name, pane } = measureTreeWidths(resources, collapsed, {
    max: getMaximumNameWidth(panel.nameColumnWidth),
    min: panel.nameColumnWidth,
  });

  return { ...panel, nameColumnWidth: name, width: pane };
}

/**
 * The widths that fit the widest of the rows showing, clamped to the limits and snapped up to a step.
 */
export function measureTreeWidths(
  resources: readonly GanttResource[],
  collapsed: readonly string[],
  limits: Readonly<TreeLimits>,
): TreeWidths {
  const closed = new Set(collapsed);
  const stack = resources.map((resource) => ({ depth: 0, resource }));
  let needed = 0;

  for (let next = stack.pop(); next !== undefined; next = stack.pop()) {
    const { depth, resource } = next;
    const children = resource.children ?? [];

    needed = Math.max(needed, measureRow(resource.title, depth, children));
    if (!closed.has(resource.id)) {
      stack.push(
        ...children.map((child) => ({ depth: depth + 1, resource: child })),
      );
    }
  }

  const clamped = Math.min(Math.max(needed, limits.min), limits.max);
  const name = Math.ceil(clamped / WIDTH_STEP) * WIDTH_STEP;

  return { name, pane: name + COUNT_COLUMN_WIDTH + PANE_GUTTER_WIDTH };
}

/**
 * The style that keeps the tree pane at least this wide, yet within the window's share.
 */
export function toTreePaneStyle(pane: number): CSSProperties {
  return Object.fromEntries([
    [
      "--timeline-tree-width",
      `min(${pane / REM_WIDTH}rem, ${MAX_TREE_SHARE * 100}%)`,
    ],
  ]);
}

// 🔏 Private Functions

/**
 * The width a row's name needs; a blank name needs none.
 */
function measureRow(
  title: string,
  depth: number,
  children: readonly GanttResource[],
): number {
  if (title === "") {
    return 0;
  }

  return (
    depth * INDENT_WIDTH +
    NAME_CHROME_WIDTH +
    (children.length > 0 ? CARET_WIDTH : 0) +
    title.length * CHARACTER_WIDTH
  );
}
