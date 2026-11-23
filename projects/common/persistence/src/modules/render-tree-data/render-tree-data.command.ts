import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { GraphEntitiesService } from "../graph-entities/graph-entities.service";
import { GraphMermaidService } from "../graph-mermaid/graph-mermaid.service";
import { GraphOptionsService } from "../graph-options/graph-options.service";
import { maskedError } from "../graph-options/graph-options.utilities";
import { GraphTreeService } from "../graph-tree/graph-tree.service";

import {
  RENDER_TREE_DATA_DESCRIPTION,
  RENDER_TREE_DATA_DIRECTION,
  renderTreeDataDryRunMessages,
} from "./render-tree-data.constants";

import type { GraphPlan } from "../graph-options/graph-options.types";
import type { RenderTreeDataCommandOptions } from "./render-tree-data.types";

/**
 * Reads a `@Tree` entity's rows from a database and prints them as a Mermaid
 * flowchart on stdout, with warnings on stderr. Every option is validated
 * before any entity file is imported or any connection opens.
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
    private readonly graphMermaid: GraphMermaidService,
    private readonly graphOptions: GraphOptionsService,
    private readonly graphTree: GraphTreeService,
  ) {
    super();
    this.logger.setContext(RenderTreeDataCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Imports the entities, connects, reads the picked tree, and writes its
   * diagram to stdout and its warnings to stderr.
   * @throws Error naming the failure, with the password masked.
   */
  private async render(plan: GraphPlan): Promise<void> {
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
    try {
      await dataSource.initialize();
      const graph = await this.graphTree.load(
        dataSource,
        dataSource.getMetadata(picked),
        {
          maximumBreadth: plan.maximumBreadth,
          maximumDepth: plan.maximumDepth,
        },
      );
      const rendering = this.graphMermaid.render(graph, {
        direction: RENDER_TREE_DATA_DIRECTION,
      });

      process.stdout.write(`${rendering.diagram}\n`);
      for (const warning of rendering.warnings) {
        process.stderr.write(`⚠️ ${warning}\n`);
      }
    } catch (error) {
      throw maskedError(error, plan.connection.password);
    } finally {
      if (dataSource.isInitialized) await dataSource.destroy();
    }
  }

  // 🌎 Public Methods

  /** Parses `--dry-run`, which checks the options and connects to no database. */
  @Option({
    description:
      "Check the options and list the entity files, without connecting to a database or drawing anything",
    flags: "--dry-run",
  })
  parseDryRun(): boolean {
    return true;
  }

  /** Collects each repeated `--entities` glob into one list. */
  @Option({
    description:
      "Glob of the entity files to import, e.g. 'src/**/*.entity.ts'; repeat for several",
    flags: "--entities <glob>",
  })
  parseEntities(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--max-breadth`, the most children drawn under one node. */
  @Option({
    description:
      "Most children drawn under any one node; the rest become one '… K more' node and a warning. Roots are never capped. Positive integer",
    flags: "--max-breadth <n>",
  })
  parseMaximumBreadth(value: string): string {
    return value;
  }

  /** Parses `--max-depth`, the deepest level drawn, roots being level 1. */
  @Option({
    description:
      "Deepest level drawn, with roots at level 1; children below it become one '… K more' node and a warning. Positive integer",
    flags: "--max-depth <n>",
  })
  parseMaximumDepth(value: string): string {
    return value;
  }

  /** Parses `--schema`, the schema the entity tables live in. */
  @Option({
    description: "Schema the entity tables live in; required",
    flags: "--schema <name>",
  })
  parseSchema(value: string): string {
    return value;
  }

  /** Parses `--source-uri`, the database to read from. */
  @Option({
    description:
      "Connection URI of the database to read from, e.g. postgresql://user:password@host:5432/database",
    flags: "--source-uri <uri>",
  })
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

  /**
   * Validates the options, then draws the picked tree. `--dry-run` stops after
   * the entity files resolve, before any connection opens.
   */
  async run(
    _passedParameters: string[],
    options: RenderTreeDataCommandOptions,
  ): Promise<void> {
    const plan = this.graphOptions.plan(options);
    if (options.dryRun === true) {
      const files = this.graphEntities.resolveFiles(plan.entities);
      for (const line of renderTreeDataDryRunMessages(plan, files)) {
        this.logger.log(line);
      }
      return;
    }
    await this.render(plan);
  }
}
