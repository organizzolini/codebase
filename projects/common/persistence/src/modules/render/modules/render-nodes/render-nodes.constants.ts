// ♟️ Constants

import { z } from "zod";

/** A node or graph row: its key and its label, as text. */
export const RENDER_NODES_ROW_SCHEMA = z.object({
  id: z.string(),
  label: z.string().nullable(),
});

/** A `@GraphLabel` property that is not a column of its entity. */
export const renderNodesColumnMessage = ({
  columns,
  entity,
  property,
}: {
  readonly columns: readonly string[];
  readonly entity: string;
  readonly property: string;
}): string =>
  `${entity} marks ${property} with @GraphLabel, but ${property} is not a column of ${entity}; columns are ${columns.join(", ")}`;
