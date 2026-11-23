// 🏷️ Types

import type {
  GraphMermaidOptions,
  GraphModel,
} from "./modules/render-mermaid/render-mermaid.types";
import type { GraphPaging } from "./modules/render-options/render-options.types";
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

/** The graphs a render read, one per page drawn, with each one's heading. */
export interface GraphPages {
  /** The graph of each page, in the order drawn. */
  readonly graphs: readonly GraphModel[];

  /** The Markdown heading of each page; empty when one graph is drawn. */
  readonly headings: readonly string[];
}
