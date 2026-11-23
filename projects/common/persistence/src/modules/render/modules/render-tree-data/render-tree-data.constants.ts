// ♟️ Constants

import { z } from "zod";

import type { GraphPaging } from "../render-options/render-options.types";
import type { RenderTreeDataPlan } from "./render-tree-data.types";

/** The command's description, shown in its help. */
export const RENDER_TREE_DATA_DESCRIPTION =
  "Draw a @Tree entity's rows as a Mermaid flowchart on stdout";

/** The diagram's direction: trees read left to right. */
export const RENDER_TREE_DATA_DIRECTION = "LR";

/** Dry-run lines, with no password, each opening with an emoji and verb. */
export const renderTreeDataDryRunMessages = (
  { connection, table }: RenderTreeDataPlan,
  files: readonly string[],
): string[] => {
  const { database, host, schema } = connection;
  const subject =
    table === undefined ? "the one @Tree entity" : `table ${table}`;
  return [
    `🔍 Planning to draw ${subject} from database "${database}" on ${host}, schema ${schema}; nothing was connected to`,
    ...files.map((file) => `🔍 Planning to read entities from ${file}`),
  ];
};

/** A row's id as text. */
export const RENDER_TREE_DATA_ID_ROW_SCHEMA = z.object({
  id: z.string(),
});

/** A tree row: id, label, and parent id, null for a root. */
export const RENDER_TREE_DATA_ROW_SCHEMA = z.object({
  id: z.string(),
  label: z.string(),
  parentId: z.string().nullable(),
});

/** SQL regex whose first group is a path's parent key. */
export const RENDER_TREE_DATA_PATH_PARENT_PATTERN = String.raw`([^.]+)\.[^.]+\.?$`;

/** The warning for a page past the last root. */
export const renderTreeDataPageMessage = (
  { limit, page }: GraphPaging,
  roots: number,
): string =>
  `Page ${String(page)} with --limit ${String(limit)} is past the last root: the tree has ${String(roots)} ${roots === 1 ? "root" : "roots"} in total, so nothing is drawn`;
