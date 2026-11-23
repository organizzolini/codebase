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
  RENDER_GRAPH_DATA_DESCRIPTION,
  RENDER_GRAPH_DATA_DIRECTION,
} from "./render-graph-data.constants";

import type { RenderCommandEntity } from "../render-command/render-command.types";

/**
 * Reads a `@Graph` entity's edges and prints them as a Mermaid flowchart on
 * stdout, or writes them to the files named, with warnings on stderr. Directed
 * edges draw arrows, undirected edges plain links. Options are validated before
 * any entity file is imported or connection opens.
 */
@Command({
  description: RENDER_GRAPH_DATA_DESCRIPTION,
  name: "render-graph-data",
})
@Injectable()
export class RenderGraphDataCommand extends RenderCommand {
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

  protected readonly decorator = "@Graph";

  protected readonly direction = RENDER_GRAPH_DATA_DIRECTION;

  protected readonly entity: RenderCommandEntity = {
    command: "render-graph-data",
    kind: "edge",
    kinds: ["graph"],
  };

  // 🔏 Private Methods

  // 🔧 Protected Methods

  // 🌎 Public Methods

  /** Collects each repeated `--filter` into one list, in the order given. */
  @Option(RENDER_FILTER_OPTION)
  parseFilter(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--limit`, the number of roots a page holds. */
  @Option({
    description:
      "Roots per page, each drawn with every node reachable from it. Directed roots are nodes no other kept edge targets, in sort order; then the smallest node still unreached, in turn, so every node has a root. An undirected component's root is its smallest node. Every page is drawn as its own diagram unless --page. Positive integer",
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

  /** Parses `--table`, the table to draw when the entities hold several graphs. */
  @Option({
    description:
      "Table of the @Graph entity to draw when --entities match several; unqualified or schema.table",
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
