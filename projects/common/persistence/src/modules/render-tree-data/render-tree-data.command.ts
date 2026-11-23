import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { GraphEntitiesService } from "../graph-entities/graph-entities.service";
import { GraphMermaidService } from "../graph-mermaid/graph-mermaid.service";
import { renderGraphMarkdown } from "../graph-mermaid/graph-mermaid.utilities";
import {
  graphOutputDryRunMessages,
  renderGraphJson,
  writeGraphOutputs,
} from "../graph-options/graph-options-outputs.utilities";
import { GraphOptionsService } from "../graph-options/graph-options.service";
import { maskedError } from "../graph-options/graph-options.utilities";
import { GraphTreeService } from "../graph-tree/graph-tree.service";

import {
  RENDER_TREE_DATA_DESCRIPTION,
  RENDER_TREE_DATA_DIRECTION,
  renderTreeDataDryRunMessages,
} from "./render-tree-data.constants";

import type {
  GraphMermaidRendering,
  GraphModel,
} from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphOutputFile,
  GraphPlan,
} from "../graph-options/graph-options.types";
import type {
  RenderTreeDataCommandOptions,
  RenderTreeDataTarget,
} from "./render-tree-data.types";

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
   * Writes the diagram to stdout, or to the files named when any is given,
   * then the warnings to stderr.
   */
  private emit(
    plan: GraphPlan,
    graph: GraphModel,
    rendering: GraphMermaidRendering,
  ): void {
    const { json, markdown } = plan.outputs;
    if (json === undefined && markdown === undefined) {
      process.stdout.write(`${rendering.diagram}\n`);
    } else {
      const files: GraphOutputFile[] = [];
      if (markdown !== undefined) {
        files.push({ content: renderGraphMarkdown(rendering), path: markdown });
      }
      if (json !== undefined) {
        files.push({ content: renderGraphJson(graph), path: json });
      }
      writeGraphOutputs(files);
      for (const file of files) {
        this.logger.log(`📝 Wrote ${file.path}`);
      }
    }
    for (const warning of rendering.warnings) {
      process.stderr.write(`⚠️ ${warning}\n`);
    }
  }

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

  /**
   * Connects, reads the picked tree, and writes its diagram and its warnings.
   * @throws Error naming the failure, with the password masked.
   */
  private async render(
    plan: GraphPlan,
    { dataSource, picked }: RenderTreeDataTarget,
  ): Promise<void> {
    try {
      await dataSource.initialize();
      const graph = await this.graphTree.load(
        dataSource,
        dataSource.getMetadata(picked),
        {
          filters: plan.filters,
          maximumBreadth: plan.maximumBreadth,
          maximumDepth: plan.maximumDepth,
          paging: plan.paging,
          sorts: plan.sorts,
        },
      );
      const rendering = this.graphMermaid.render(graph, {
        direction: RENDER_TREE_DATA_DIRECTION,
      });
      this.emit(plan, graph, rendering);
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

  /** Parses `--output-json`, the file the normalized graph is written to. */
  @Option({
    description:
      "Write the graph as pretty JSON to this file, creating its folders; with any output file, the diagram is not printed. An existing file is refused unless --overwrite. Relative paths resolve from the working directory",
    flags: "--output-json <path>",
  })
  parseOutputJson(value: string): string {
    return value;
  }

  /** Parses `--output-markdown`, the file the diagram is written to. */
  @Option({
    description:
      "Write the diagram as a fenced Mermaid block to this file, creating its folders, with warnings after the fence; with any output file, the diagram is not printed. An existing file is refused unless --overwrite. Relative paths resolve from the working directory",
    flags: "--output-markdown <path>",
  })
  parseOutputMarkdown(value: string): string {
    return value;
  }

  /** Parses `--overwrite`, which lets an output file that exists be replaced. */
  @Option({
    description:
      "Replace an existing --output-markdown or --output-json file; without it, an existing file is refused and left unchanged",
    flags: "--overwrite",
  })
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
  @Option({
    description: "Schema the entity tables live in; required",
    flags: "--schema <name>",
  })
  parseSchema(value: string): string {
    return value;
  }

  /** Collects each repeated `--sort` into one list of keys, applied in the order given. */
  @Option({
    description:
      "Sort siblings by column[:asc|desc], e.g. --sort name:desc; repeat for several keys, applied in order. Applied before --max-depth and --max-breadth cut the tree",
    flags: "--sort <expression>",
  })
  parseSort(value: string, previous: string[] = []): string[] {
    return [...previous, value];
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
      const lines = [
        ...renderTreeDataDryRunMessages(plan, files),
        ...graphOutputDryRunMessages(plan.outputs),
      ];
      for (const line of lines) {
        this.logger.log(line);
      }
      return;
    }
    const target = await this.prepare(plan);
    await this.render(plan, target);
  }
}
