import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { GraphDagService } from "../../../graph-dag/graph-dag.service";
import { GraphEntitiesService } from "../../../graph-entities/graph-entities.service";
import { graphOutputDryRunMessages } from "../../../graph-options/graph-options-outputs.utilities";
import {
  GRAPH_DRY_RUN_OPTION,
  GRAPH_ENTITIES_OPTION,
  GRAPH_FILTER_OPTION,
  GRAPH_OUTPUT_JSON_OPTION,
  GRAPH_OUTPUT_MARKDOWN_OPTION,
  GRAPH_OVERWRITE_OPTION,
  GRAPH_SCHEMA_OPTION,
  GRAPH_SORT_OPTION,
  GRAPH_SOURCE_URI_OPTION,
  GRAPH_TRUNCATE_BREADTH_OPTION,
  GRAPH_TRUNCATE_DEPTH_OPTION,
} from "../../../graph-options/graph-options.constants";
import { GraphOptionsService } from "../../../graph-options/graph-options.service";
import { graphDrawDryRunMessages } from "../../render.constants";
import { RenderService } from "../../render.service";

import {
  RENDER_GRAPH_DATA_DESCRIPTION,
  RENDER_GRAPH_DATA_DIRECTION,
} from "./render-graph-data.constants";

import type { GraphCommandOptions } from "../../../graph-options/graph-options.types";

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
export class RenderGraphDataCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly graphDag: GraphDagService,
    private readonly graphEntities: GraphEntitiesService,
    private readonly graphOptions: GraphOptionsService,
    private readonly graphRender: RenderService,
  ) {
    super();
    this.logger.setContext(RenderGraphDataCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Parses `--dry-run`, which checks the options and connects to no database. */
  @Option(GRAPH_DRY_RUN_OPTION)
  parseDryRun(): boolean {
    return true;
  }

  /** Collects each repeated `--entities` glob into one list. */
  @Option(GRAPH_ENTITIES_OPTION)
  parseEntities(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Collects each repeated `--filter` into one list, in the order given. */
  @Option(GRAPH_FILTER_OPTION)
  parseFilter(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--limit`, the number of roots a page holds. */
  @Option({
    description:
      "Roots per page, each drawn with every node reachable from it. Directed roots are nodes no other kept edge targets, in sort order; then the smallest node still unreached, in turn, so every node has a root. An undirected component's root is its smallest node. The first page unless --page. Positive integer",
    flags: "--limit <n>",
  })
  parseLimit(value: string): string {
    return value;
  }

  /** Parses `--output-json`, the file the normalized graph is written to. */
  @Option(GRAPH_OUTPUT_JSON_OPTION)
  parseOutputJson(value: string): string {
    return value;
  }

  /** Parses `--output-markdown`, the file the diagram is written to. */
  @Option(GRAPH_OUTPUT_MARKDOWN_OPTION)
  parseOutputMarkdown(value: string): string {
    return value;
  }

  /** Parses `--overwrite`, which lets an output file that exists be replaced. */
  @Option(GRAPH_OVERWRITE_OPTION)
  parseOverwrite(): boolean {
    return true;
  }

  /** Parses `--page`, the page of `--limit` roots to draw, from 1. */
  @Option({
    description:
      "Page of --limit roots to draw, from 1; needs --limit. A page past the last root draws nothing and warns. Positive integer",
    flags: "--page <n>",
  })
  parsePage(value: string): string {
    return value;
  }

  /** Parses `--schema`, the schema the entity tables live in. */
  @Option(GRAPH_SCHEMA_OPTION)
  parseSchema(value: string): string {
    return value;
  }

  /** Collects each repeated `--sort` into one list of keys, applied in the order given. */
  @Option(GRAPH_SORT_OPTION)
  parseSort(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--source-uri`, the database to read from. */
  @Option(GRAPH_SOURCE_URI_OPTION)
  parseSourceUri(value: string): string {
    return value;
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
  @Option(GRAPH_TRUNCATE_BREADTH_OPTION)
  parseTruncateBreadth(value: string): string {
    return value;
  }

  /** Parses `--truncate-depth`, the deepest level drawn, roots being level 1. */
  @Option(GRAPH_TRUNCATE_DEPTH_OPTION)
  parseTruncateDepth(value: string): string {
    return value;
  }

  /**
   * Validates the options, then draws the picked graph. `--dry-run` stops after
   * the entity files resolve, before any connection opens.
   */
  async run(
    _passedParameters: string[],
    options: GraphCommandOptions,
  ): Promise<void> {
    const plan = this.graphOptions.plan(options);
    if (options.dryRun === true) {
      const files = this.graphEntities.resolveFiles(plan.entities);
      const lines = [
        ...graphDrawDryRunMessages(plan, files, "@Graph"),
        ...graphOutputDryRunMessages(plan.outputs),
      ];
      for (const line of lines) {
        this.logger.log(line);
      }
      return;
    }
    const { dataSource, picked } = await this.graphEntities.prepareEdge(plan, {
      command: "render-graph-data",
      kinds: ["graph"],
    });
    const edge = this.graphEntities.describeEdge(picked);
    const written = await this.graphRender.render(plan, {
      dataSource,
      direction: RENDER_GRAPH_DATA_DIRECTION,
      read: async () =>
        this.graphDag.load(dataSource, dataSource.getMetadata(picked), {
          edge,
          filters: plan.filters,
          paging: plan.paging,
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
