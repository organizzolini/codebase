// ♟️ Constants

import { z } from "zod";

/** A row of an adjacency-list or closure-table tree: its parent column is its key. */
export const GRAPH_TREE_PARENT_ROW_SCHEMA = z.object({
  id: z.string(),
  label: z.string(),
  parentId: z.string().nullable(),
});

/** A row of a materialized-path tree, whose path lists its ancestors' keys. */
export const GRAPH_TREE_PATH_ROW_SCHEMA = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string(),
});

/** A row of a nested-set tree, whose interval places it among its ancestors. */
export const GRAPH_TREE_NESTED_SET_ROW_SCHEMA = z.object({
  id: z.string(),
  label: z.string(),
  left: z.coerce.number(),
  right: z.coerce.number(),
});

/** The separator of a materialized path's keys. */
export const GRAPH_TREE_PATH_SEPARATOR = ".";
