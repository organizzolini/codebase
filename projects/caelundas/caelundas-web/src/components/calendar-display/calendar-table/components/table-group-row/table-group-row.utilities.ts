import {
  GROUP_ROW_HEIGHT_REM,
  HEADER_HEIGHT_REM,
  INDENT_REM,
} from "../../calendar-table.constants";

// 🔏 Private Functions

// 🌎 Public Functions

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
 * Where a group's header sticks, as a CSS length: below the table's header and the headers it is nested in.
 */
export function getGroupTop(depth: number): string {
  return `${String(HEADER_HEIGHT_REM + depth * GROUP_ROW_HEIGHT_REM)}rem`;
}
