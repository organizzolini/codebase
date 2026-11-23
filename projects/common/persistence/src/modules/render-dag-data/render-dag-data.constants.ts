// ♟️ Constants

import type { RenderDagDataPlan } from "./render-dag-data.types";

/** The command's description, shown in its help. */
export const RENDER_DAG_DATA_DESCRIPTION =
  "Draw a @Dag entity's edges as a Mermaid flowchart on stdout";

/** The diagram's direction: a DAG reads top to bottom. */
export const RENDER_DAG_DATA_DIRECTION = "TB";

/** Dry-run lines, with no password, each opening with an emoji and verb. */
export const renderDagDataDryRunMessages = (
  { connection, table }: RenderDagDataPlan,
  files: readonly string[],
): string[] => {
  const { database, host, schema } = connection;
  const subject =
    table === undefined ? "the one @Dag entity" : `table ${table}`;
  return [
    `🔍 Planning to draw ${subject} from database "${database}" on ${host}, schema ${schema}; nothing was connected to`,
    ...files.map((file) => `🔍 Planning to read entities from ${file}`),
  ];
};
