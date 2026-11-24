import { CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { graphDrawDryRunMessages } from "../../render.constants";
import { RenderService } from "../../render.service";
import { RenderEntitiesService } from "../render-entities/render-entities.service";
import { RenderNodesService } from "../render-nodes/render-nodes.service";
import { graphOutputDryRunMessages } from "../render-options/render-options-outputs.utilities";
import {
  RENDER_DRY_RUN_OPTION,
  RENDER_ENTITIES_OPTION,
  RENDER_OUTPUT_JSON_OPTION,
  RENDER_OUTPUT_MARKDOWN_OPTION,
  RENDER_OVERWRITE_OPTION,
  RENDER_PAGE_OPTION,
  RENDER_SCHEMA_OPTION,
  RENDER_SOURCE_URI_OPTION,
} from "../render-options/render-options.constants";
import { RenderOptionsService } from "../render-options/render-options.service";

import { RENDER_COMMAND_HELP_CONFIGURATION } from "./render-command.constants";

import type { GraphDrawing } from "../../render.types";
import type {
  GraphCommandOptions,
  GraphPlan,
} from "../render-options/render-options.types";
import type {
  RenderCommandCommander,
  RenderCommandEntity,
  RenderCommandReader,
} from "./render-command.types";

/**
 * What every drawing command shares: the flags none of them words differently,
 * and the run of plan, dry run, prepare, render, and log. A subclass names the
 * entity it draws and its decorator and direction, and says how to read it.
 */
export abstract class RenderCommand extends CommandRunner {
  // 🏗 Dependency Injection

  protected constructor(
    protected readonly logger: LoggerService,
    protected readonly renderEntities: RenderEntitiesService,
    protected readonly renderNodes: RenderNodesService,
    protected readonly renderOptions: RenderOptionsService,
    protected readonly renderService: RenderService,
  ) {
    super();
    this.logger.setContext(new.target.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  /** The decorator of the drawn entity, named in its dry run. */
  protected abstract readonly decorator: string;

  /** The diagram's direction, which suits the shape of the command's data. */
  protected abstract readonly direction: GraphDrawing["direction"];

  /** The entity the command draws, which says how to prepare it. */
  protected abstract readonly entity: RenderCommandEntity;

  /** The service that reads the picked entity's table as a graph. */
  protected abstract readonly reader: RenderCommandReader;

  // 🔏 Private Methods

  /** The dry-run lines: what would be drawn and written, with no connection made. */
  private dryRun(plan: GraphPlan): string[] {
    const files = this.renderEntities.resolveFiles(plan.entities);
    return [
      ...graphDrawDryRunMessages(plan, files, this.decorator),
      ...graphOutputDryRunMessages(plan.outputs),
    ];
  }

  // 🔧 Protected Methods

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
  @Option(RENDER_PAGE_OPTION)
  parsePage(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Parses `--schema`, the schema the entity tables live in. */
  @Option(RENDER_SCHEMA_OPTION)
  parseSchema(value: string): string {
    return value;
  }

  /** Parses `--source-uri`, the database to read from. */
  @Option(RENDER_SOURCE_URI_OPTION)
  parseSourceUri(value: string): string {
    return value;
  }

  /**
   * Validates the options, then draws the picked entity. `--dry-run` stops
   * after the entity files resolve, before any connection opens.
   */
  async run(
    _passedParameters: string[],
    options: GraphCommandOptions,
  ): Promise<void> {
    const plan = this.renderOptions.plan(options);
    if (options.dryRun === true) {
      for (const line of this.dryRun(plan)) {
        this.logger.log(line);
      }
      return;
    }
    const { dataSource, picked } =
      this.entity.kind === "tree"
        ? await this.renderEntities.prepareTree(plan)
        : await this.renderEntities.prepareEdge(plan, this.entity);
    const edge =
      this.entity.kind === "edge"
        ? this.renderEntities.describeEdge(picked)
        : undefined;
    const written = await this.renderService.render(plan, {
      dataSource,
      direction: this.direction,
      read: async (paging) => {
        const graph = await this.reader.load(
          dataSource,
          dataSource.getMetadata(picked),
          {
            edge,
            filters: plan.filters,
            paging,
            sorts: plan.sorts,
            truncateBreadth: plan.truncateBreadth,
            truncateDepth: plan.truncateDepth,
          },
        );
        return edge?.generated === undefined
          ? graph
          : this.renderNodes.relabel(dataSource, graph, edge.generated);
      },
    });
    for (const line of written) {
      this.logger.log(line);
    }
  }

  /**
   * Sorts the help's options by flag, since commander lists a subclass's own
   * before the ones it inherits.
   */
  override setCommand(command: RenderCommandCommander): this {
    command.configureHelp(RENDER_COMMAND_HELP_CONFIGURATION);
    return super.setCommand(command);
  }
}
