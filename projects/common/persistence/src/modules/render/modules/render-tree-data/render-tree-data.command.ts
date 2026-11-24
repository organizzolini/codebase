import { Injectable } from "@nestjs/common";
import { Command, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { RenderService } from "../../render.service";
import { RenderCommand } from "../render-command/render-command.command";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { RenderNodesService } from "../render-nodes/render-nodes.service";
import { RENDER_DIAGRAM_OPTION } from "../render-options/render-options.constants";
import { RenderOptionsService } from "../render-options/render-options.service";
import { RenderTreesService } from "../render-trees/render-trees.service";

import {
  RENDER_TREE_DATA_DESCRIPTION,
  RENDER_TREE_DATA_DIRECTION,
} from "./render-tree-data.constants";

import type { RenderCommandEntity } from "../render-command/render-command.types";

/**
 * Reads a `@Tree` entity's rows from a database and prints them as a Mermaid
 * flowchart on stdout, or writes them to the files named, with warnings on
 * stderr. Every option is validated before any entity file is imported or any
 * connection opens.
 */
@Command({
  description: RENDER_TREE_DATA_DESCRIPTION,
  name: "render-tree-data",
})
@Injectable()
export class RenderTreeDataCommand extends RenderCommand {
  // 🏗 Dependency Injection

  constructor(
    logger: LoggerService,
    renderEntities: RenderEntitiesService,
    renderNodes: RenderNodesService,
    renderOptions: RenderOptionsService,
    renderService: RenderService,
    protected readonly reader: RenderTreesService,
  ) {
    super(logger, renderEntities, renderNodes, renderOptions, renderService);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  protected readonly decorator = "@Tree";

  protected readonly direction = RENDER_TREE_DATA_DIRECTION;

  protected readonly entity: RenderCommandEntity = { kind: "tree" };

  // 🔏 Private Methods

  // 🔧 Protected Methods

  // 🌎 Public Methods

  /** Parses `--diagram`, the Mermaid diagram to draw: a flowchart or a file tree. */
  @Option(RENDER_DIAGRAM_OPTION)
  parseDiagram(value: string): string {
    return value;
  }

  /** Collects each repeated `--filter` into one list, in the order given. */
  @Option({
    description:
      "Keep rows matching column<op>value, e.g. --filter name~=Inbox; repeat and all must match. Operators: = (equal), != (not equal), ~= (contains, case-sensitive), < and > (numeric or date columns only). A matching row keeps its ancestors and its descendants",
    flags: "--filter <expression>",
  })
  parseFilter(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--limit`, the number of root nodes a page holds. */
  @Option({
    description:
      "Root nodes per page, each drawn with its descendants, in sort order; every page as its own diagram unless --page. Positive integer",
    flags: "--limit <n>",
  })
  parseLimit(value: string): string {
    return value;
  }

  /** Collects each repeated `--sort` into one list of keys, applied in the order given. */
  @Option({
    description:
      "Sort siblings by column[:asc|desc], e.g. --sort name:desc; repeat for several keys, applied in order. Applied before --truncate-depth and --truncate-breadth cut the tree",
    flags: "--sort <expression>",
  })
  parseSort(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--table`, the table to draw when the entities hold several trees. */
  @Option({
    description:
      "Table of the tree to draw when --entities match several; unqualified or schema.table",
    flags: "--table <name>",
  })
  parseTable(value: string): string {
    return value;
  }

  /** Parses `--truncate-breadth`, the most children drawn under one node. */
  @Option({
    description:
      "Most children drawn under any one node; the rest become one '… K more' node and a warning. Roots are never capped. Positive integer",
    flags: "--truncate-breadth <n>",
  })
  parseTruncateBreadth(value: string): string {
    return value;
  }

  /** Parses `--truncate-depth`, the deepest level drawn, roots being level 1. */
  @Option({
    description:
      "Deepest level drawn, with roots at level 1; children below it become one '… K more' node and a warning. Positive integer",
    flags: "--truncate-depth <n>",
  })
  parseTruncateDepth(value: string): string {
    return value;
  }
}
