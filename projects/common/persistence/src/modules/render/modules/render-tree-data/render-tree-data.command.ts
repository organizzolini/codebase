import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { GraphEntitiesService } from "../../../graph-entities/graph-entities.service";
import { graphOutputDryRunMessages } from "../../../graph-options/graph-options-outputs.utilities";
import {
  GRAPH_DRY_RUN_OPTION,
  GRAPH_ENTITIES_OPTION,
  GRAPH_OUTPUT_JSON_OPTION,
  GRAPH_OUTPUT_MARKDOWN_OPTION,
  GRAPH_OVERWRITE_OPTION,
  GRAPH_SCHEMA_OPTION,
  GRAPH_SOURCE_URI_OPTION,
} from "../../../graph-options/graph-options.constants";
import { GraphOptionsService } from "../../../graph-options/graph-options.service";
import { GraphTreeService } from "../../../graph-tree/graph-tree.service";
import { RenderService } from "../../render.service";

import {
  RENDER_TREE_DATA_DESCRIPTION,
  RENDER_TREE_DATA_DIRECTION,
  renderTreeDataDryRunMessages,
} from "./render-tree-data.constants";

import type {
  GraphCommandOptions,
  GraphPlan,
} from "../../../graph-options/graph-options.types";
import type { RenderTreeDataTarget } from "./render-tree-data.types";

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
export class RenderTreeDataCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly graphEntities: GraphEntitiesService,
    private readonly graphOptions: GraphOptionsService,
    private readonly graphRender: RenderService,
    private readonly graphTree: GraphTreeService,
  ) {
    super();
    this.logger.setContext(RenderTreeDataCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Imports the entities, picks the tree, and checks its columns, before any
   * connection opens.
   */
  private async prepare(plan: GraphPlan): Promise<RenderTreeDataTarget> {
    const entities = await this.graphEntities.load(plan.entities);
    const dataSource = this.graphEntities.createDataSource(
      plan.connection,
      entities,
    );
    const picked = this.graphEntities.pickTree({
      entities,
      globs: plan.entities,
      namingStrategy: dataSource.namingStrategy,
      table: plan.table,
    });
    this.graphEntities.assertColumns(picked, plan.filters, plan.sorts);
    return { dataSource, picked };
  }

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
      "Root nodes per page, each drawn with its descendants, in sort order; the first page unless --page. Positive integer",
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
  @Option({
    description:
      "Sort siblings by column[:asc|desc], e.g. --sort name:desc; repeat for several keys, applied in order. Applied before --truncate-depth and --truncate-breadth cut the tree",
    flags: "--sort <expression>",
  })
  parseSort(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--source-uri`, the database to read from. */
  @Option(GRAPH_SOURCE_URI_OPTION)
  parseSourceUri(value: string): string {
    return value;
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

  /**
   * Validates the options, then draws the picked tree. `--dry-run` stops after
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
        ...renderTreeDataDryRunMessages(plan, files),
        ...graphOutputDryRunMessages(plan.outputs),
      ];
      for (const line of lines) {
        this.logger.log(line);
      }
      return;
    }
    const { dataSource, picked } = await this.prepare(plan);
    const written = await this.graphRender.render(plan, {
      dataSource,
      direction: RENDER_TREE_DATA_DIRECTION,
      read: async () =>
        this.graphTree.load(dataSource, dataSource.getMetadata(picked), {
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
