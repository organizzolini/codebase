import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { graphDrawDryRunMessages } from "../../render.constants";
import { RenderService } from "../../render.service";
import { RenderEdgesService } from "../render-edges/render-edges.service";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { graphOutputDryRunMessages } from "../render-options/render-options-outputs.utilities";
import {
  RENDER_DRY_RUN_OPTION,
  RENDER_ENTITIES_OPTION,
  RENDER_FILTER_OPTION,
  RENDER_OUTPUT_JSON_OPTION,
  RENDER_OUTPUT_MARKDOWN_OPTION,
  RENDER_OVERWRITE_OPTION,
  RENDER_SCHEMA_OPTION,
  RENDER_SORT_OPTION,
  RENDER_SOURCE_URI_OPTION,
  RENDER_TRUNCATE_BREADTH_OPTION,
  RENDER_TRUNCATE_DEPTH_OPTION,
} from "../render-options/render-options.constants";
import { RenderOptionsService } from "../render-options/render-options.service";

import {
  RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DESCRIPTION,
  RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DIRECTION,
} from "./render-directed-acyclic-graph-data.constants";

import type { GraphCommandOptions } from "../render-options/render-options.types";

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
export class RenderDirectedAcyclicGraphDataCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly renderEdges: RenderEdgesService,
    private readonly renderEntities: RenderEntitiesService,
    private readonly renderOptions: RenderOptionsService,
    private readonly renderService: RenderService,
  ) {
    super();
    this.logger.setContext(RenderDirectedAcyclicGraphDataCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Parses `--dry-run`, which checks the options and connects to no database. */
  @Option(RENDER_DRY_RUN_OPTION)
  parseDryRun(): boolean {
    return true;
  }

  /** Collects each repeated `--entities` glob into one list. */
  @Option(RENDER_ENTITIES_OPTION)
  parseEntities(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

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

  /** Parses `--output-json`, the file the normalized graph is written to. */
  @Option(RENDER_OUTPUT_JSON_OPTION)
  parseOutputJson(value: string): string {
    return value;
  }

  /** Parses `--output-markdown`, the file the diagram is written to. */
  @Option(RENDER_OUTPUT_MARKDOWN_OPTION)
  parseOutputMarkdown(value: string): string {
    return value;
  }

  /** Parses `--overwrite`, which lets an output file that exists be replaced. */
  @Option(RENDER_OVERWRITE_OPTION)
  parseOverwrite(): boolean {
    return true;
  }

  /** Parses `--page`, the page of `--limit` roots to draw, from 1. */
  @Option({
    description:
      "Page of --limit roots to draw, from 1; repeat for several, each its own diagram; needs --limit. A page past the last root draws nothing and warns. Without it, every page is drawn. Positive integer",
    flags: "--page <n>",
  })
  parsePage(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--schema`, the schema the entity tables live in. */
  @Option(RENDER_SCHEMA_OPTION)
  parseSchema(value: string): string {
    return value;
  }

  /** Collects each repeated `--sort` into one list of keys, applied in the order given. */
  @Option(RENDER_SORT_OPTION)
  parseSort(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--source-uri`, the database to read from. */
  @Option(RENDER_SOURCE_URI_OPTION)
  parseSourceUri(value: string): string {
    return value;
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

  /**
   * Validates the options, then draws the picked directed acyclic graph. `--dry-run` stops after
   * the entity files resolve, before any connection opens.
   */
  async run(
    _passedParameters: string[],
    options: GraphCommandOptions,
  ): Promise<void> {
    const plan = this.renderOptions.plan(options);
    if (options.dryRun === true) {
      const files = this.renderEntities.resolveFiles(plan.entities);
      const lines = [
        ...graphDrawDryRunMessages(plan, files, "@DirectedAcyclicGraph"),
        ...graphOutputDryRunMessages(plan.outputs),
      ];
      for (const line of lines) {
        this.logger.log(line);
      }
      return;
    }
    const { dataSource, picked } = await this.renderEntities.prepareEdge(plan, {
      command: "render-directed-acyclic-graph-data",
      kinds: ["directed-acyclic-graph"],
    });
    const edge = this.renderEntities.describeEdge(picked);
    const written = await this.renderService.render(plan, {
      dataSource,
      direction: RENDER_DIRECTED_ACYCLIC_GRAPH_DATA_DIRECTION,
      read: async (paging) =>
        this.renderEdges.load(dataSource, dataSource.getMetadata(picked), {
          edge,
          filters: plan.filters,
          paging,
          sorts: plan.sorts,
          truncateBreadth: plan.truncateBreadth,
          truncateDepth: plan.truncateDepth,
        }),
    });
    for (const line of written) {
      this.logger.log(line);
    }
  }
}
