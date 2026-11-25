import {
  deriveChildColor,
  readOklch,
} from "../../../events-calendar/components/calendar-color-schemes/calendar-color-derive.utilities";
import {
  GROUP_ROW_HEIGHT_REM,
  GROUP_TINT_PERCENT,
  INDENT_REM,
} from "../../calendar-table.constants";
import { getNameTint } from "../table-name-cell/table-name-cell.utilities";

import type { EventGroupNode } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { ColorLegendEntry } from "../../../events-calendar/components/calendar-color-schemes/calendar-color-schemes.types";
import type { TableRowModel } from "../../calendar-table.types";
import type { CSSProperties } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The colors of a legend by tag key, so a group finds its own.
 */
export function createGroupColors(
  legend: readonly ColorLegendEntry[],
): ReadonlyMap<string, string> {
  return new Map(legend.map((entry) => [entry.key, entry.color]));
}

/**
 * Colors every group by its node id: a tag's own color from the legend, else a shade near its parent group's.
 */
export function createNodeColors(
  roots: readonly EventGroupNode[],
  tagColors: ReadonlyMap<string, string>,
): ReadonlyMap<string, string> {
  const colors = new Map<string, string>();

  const paint = (
    nodes: readonly EventGroupNode[],
    parent: string | undefined,
    depth: number,
  ): void => {
    for (const [index, node] of nodes.entries()) {
      const own = node.key === null ? undefined : tagColors.get(node.key);
      const color =
        own ??
        (parent === undefined
          ? undefined
          : deriveChildColor(readOklch(parent), {
              depth,
              index,
              siblingCount: nodes.length,
            }));

      if (color !== undefined) {
        colors.set(node.id, color);
      }

      paint(node.children, color, depth + 1);
    }
  };

  paint(roots, undefined, 1);

  return colors;
}

/**
 * The node colors of the top groups among rows, or none when colors are off.
 */
export function createRowColors(
  rows: readonly TableRowModel[],
  tagColors: ReadonlyMap<string, string> | undefined,
): ReadonlyMap<string, string> | undefined {
  if (tagColors === undefined) {
    return undefined;
  }

  const roots: EventGroupNode[] = [];

  for (const row of rows) {
    if (row.kind === "group" && row.depth === 0) {
      roots.push(row.node);
    }
  }

  return createNodeColors(roots, tagColors);
}

/**
 * The height every group header has, as a CSS length, so the offsets of the nested ones are exact.
 */
export function getGroupHeight(): string {
  return `${String(GROUP_ROW_HEIGHT_REM)}rem`;
}

/**
 * How far in from the left a group's button sits, as a CSS length.
 */
export function getGroupIndent(depth: number): string {
  return `${String(depth * INDENT_REM)}rem`;
}

/**
 * The pill tint of a group, as an event's name is tinted; none when uncolored.
 */
export function getGroupTint(
  colors: ReadonlyMap<string, string> | undefined,
  node: EventGroupNode,
): CSSProperties | undefined {
  return getNameTint(colors?.get(node.id) ?? null, GROUP_TINT_PERCENT);
}

/**
 * Where a group's header sticks, as a CSS length: below the headers it is nested in.
 */
export function getGroupTop(depth: number): string {
  return `${String(depth * GROUP_ROW_HEIGHT_REM)}rem`;
}
