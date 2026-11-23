// 🏷️ Types

import type {
  GraphMermaidOptions,
  GraphModel,
} from "../graph-mermaid/graph-mermaid.types";
import type { GraphPaging } from "../graph-options/graph-options.types";
import type { DataSource } from "typeorm";

/** What a command draws: its connection, direction, and read. */
export interface GraphDrawing {
  /** The connection the graph is read through, not yet open. */
  readonly dataSource: DataSource;

  /** The diagram's direction, which each command chooses for its shape of data. */
  readonly direction: NonNullable<GraphMermaidOptions["direction"]>;

  /** Reads the graph, or the page of it `paging` names, with the connection open. */
  readonly read: (paging: GraphPaging | undefined) => Promise<GraphModel>;
}
