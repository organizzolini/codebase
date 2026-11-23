import { Injectable } from "@nestjs/common";
import { Command, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { RenderService } from "../../render.service";
import { RenderCommand } from "../render-command/render-command.command";
import { RenderEdgesService } from "../render-edges/render-edges.service";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import {
  RENDER_FILTER_OPTION,
  RENDER_SORT_OPTION,
  RENDER_TRUNCATE_BREADTH_OPTION,
  RENDER_TRUNCATE_DEPTH_OPTION,
} from "../render-options/render-options.constants";
import { RenderOptionsService } from "../render-options/render-options.service";

import {
  RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DESCRIPTION,
  RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DIRECTION,
} from "./render-directed-acyclic-graph-data.constants";

import type { RenderCommandEntity } from "../render-command/render-command.types";

/**
 * Reads a `@DirectedAcyclicGraph` entity's edges from a database and prints them as a Mermaid
 * flowchart on stdout, or writes them to the files named, with warnings on
 * stderr. Every option is validated before any entity file is imported or any
 * connection opens.
 */
@Command({
  description: RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DESCRIPTION,
  name: "render-directed-acyclic-graph-data",
})
@Injectable()
export class RenderDirectedAcyclicGraphDataCommand extends RenderCommand {
  // 🏗 Dependency Injection

  constructor(
    logger: LoggerService,
    protected readonly reader: RenderEdgesService,
    renderEntities: RenderEntitiesService,
    renderOptions: RenderOptionsService,
    renderService: RenderService,
  ) {
    super(logger, renderEntities, renderOptions, renderService);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  protected readonly decorator = "@DirectedAcyclicGraph";

  protected readonly direction = RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DIRECTION;

  protected readonly entity: RenderCommandEntity = {
    command: "render-directed-acyclic-graph-data",
    kind: "edge",
    kinds: ["directed-acyclic-graph"],
  };

  // 🔏 Private Methods

  // 🔧 Protected Methods

  // 🌎 Public Methods

  /** Collects each repeated `--filter` into one list, in the order given. */
  @Option(RENDER_FILTER_OPTION)
  parseFilter(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--limit`, the number of root nodes a page holds. */
  @Option({
    description:
      "Root nodes per page, each drawn with every node reachable from it; roots are nodes no kept edge targets, in sort order; every page as its own diagram unless --page. A component with no root is drawn only without --limit. Positive integer",
    flags: "--limit <n>",
  })
  parseLimit(value: string): string {
    return value;
  }

  /** Collects each repeated `--sort` into one list of keys, applied in the order given. */
  @Option(RENDER_SORT_OPTION)
  parseSort(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--table`, the table to draw when the entities hold several directed acyclic graphs. */
  @Option({
    description:
      "Table of the @DirectedAcyclicGraph entity to draw when --entities match several; unqualified or schema.table",
    flags: "--table <name>",
  })
  parseTable(value: string): string {
    return value;
  }

  /** Parses `--truncate-breadth`, the most children drawn under one node. */
  @Option(RENDER_TRUNCATE_BREADTH_OPTION)
  parseTruncateBreadth(value: string): string {
    return value;
  }

  /** Parses `--truncate-depth`, the deepest level drawn, roots being level 1. */
  @Option(RENDER_TRUNCATE_DEPTH_OPTION)
  parseTruncateDepth(value: string): string {
    return value;
  }
}
