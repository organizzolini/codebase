// ♟️ Constants

import type { GraphPlan } from "../graph-options/graph-options.types";

/** The log line naming a file a render wrote. */
export const graphRenderWroteMessage = (file: string): string =>
  `📝 Wrote ${file}`;

/** Dry-run lines naming the entity, database, and files read. */
export const graphDrawDryRunMessages = (
  { connection, table }: GraphPlan,
  files: readonly string[],
  decorator: string,
): string[] => {
  const { database, host, schema } = connection;
  const subject =
    table === undefined ? `the one ${decorator} entity` : `table ${table}`;
  return [
    `🔍 Planning to draw ${subject} from database "${database}" on ${host}, schema ${schema}; nothing was connected to`,
    ...files.map((file) => `🔍 Planning to read entities from ${file}`),
  ];
};
