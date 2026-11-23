// ♟️ Constants

import { z } from "zod";

import type { GraphPaging } from "../render-options/render-options.types";

/** A row's id as text. */
export const RENDER_TREES_ID_ROW_SCHEMA = z.object({
  id: z.string(),
});

/** A tree row: id, label, and parent id, null for a root. */
export const RENDER_TREES_ROW_SCHEMA = z.object({
  id: z.string(),
  label: z.string(),
  parentId: z.string().nullable(),
});

/** SQL regex whose first group is a path's parent key. */
export const RENDER_TREES_PATH_PARENT_PATTERN = String.raw`([^.]+)\.[^.]+\.?$`;

/** The warning for a page past the last root. */
export const renderTreesPageMessage = (
  { limit, page }: GraphPaging,
  roots: number,
): string =>
  `Page ${String(page)} with --limit ${String(limit)} is past the last root: the tree has ${String(roots)} ${roots === 1 ? "root" : "roots"} in total, so nothing is drawn`;
