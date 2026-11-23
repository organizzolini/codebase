// 🏷️ Types

import type {
  GraphEdgeKind,
  GraphEdgeMetadata,
} from "../render-entities/render-entities.types";
import type { GraphModel } from "../render-mermaid/render-mermaid.types";
import type { GraphReadOptions } from "../render-options/render-options.types";
import type { CommandRunner } from "nest-commander";
import type { DataSource, EntityMetadata } from "typeorm";

/** The commander command a runner is handed, whose help it configures. */
export type RenderCommandCommander = Parameters<CommandRunner["setCommand"]>[0];

/** The entity a command draws: a tree, or edge kinds. */
export type RenderCommandEntity =
  | {
      /** The command's name, which an entity of another kind is told to use. */
      readonly command: string;
      readonly kind: "edge";
      /** The edge kinds the command draws. */
      readonly kinds: readonly GraphEdgeKind[];
    }
  | { readonly kind: "tree" };

/** The part of a commander option that orders it in the help. */
export interface RenderCommandHelpOption {
  /** The long flag, such as `--limit`; `--help` for the help option. */
  readonly long?: string;
}

/** Reads the picked entity's table as a graph. */
export interface RenderCommandReader {
  /** Reads the table `metadata` describes, filtered, sorted, paged, then capped. */
  load(
    dataSource: DataSource,
    metadata: EntityMetadata,
    options: RenderCommandReadOptions,
  ): Promise<GraphModel>;
}

/** What a read of the picked entity's table is given. */
export interface RenderCommandReadOptions extends GraphReadOptions {
  /** How the entity's decorators describe its edge columns; none for a tree. */
  readonly edge?: GraphEdgeMetadata | undefined;
}
