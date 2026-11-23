// ♟️ Constants

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
