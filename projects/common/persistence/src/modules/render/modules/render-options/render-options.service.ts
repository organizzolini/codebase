import { Injectable } from "@nestjs/common";

import { resolveGraphOutputs } from "./render-options-outputs.utilities";
import {
  RENDER_OPTION_MESSAGES,
  RenderOptionsError,
  renderOptionsTableSchemaMessage,
} from "./render-options.constants";
import {
  parseGraphPaging,
  parseGraphRows,
  parseGraphSource,
  positiveIntegerFlag,
} from "./render-options.utilities";

import type { GraphOptions, GraphPlan } from "./render-options.types";

/**
 * Validates the connection and entity options every graph command shares,
 * before any entity file is imported or any database is reached.
 */
@Injectable()
export class RenderOptionsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The table `--table` names, its schema qualifier dropped when it is
   * `schema`.
   * @throws RenderOptionsError when the qualifier names another schema.
   */
  private tableName(
    table: string | undefined,
    schema: string,
  ): string | undefined {
    if (table === undefined) return undefined;
    const dot = table.indexOf(".");
    if (dot === -1) return table;

    const qualifier = table.slice(0, dot);
    if (qualifier !== schema) {
      throw new RenderOptionsError(
        renderOptionsTableSchemaMessage(table, schema),
      );
    }
    return table.slice(dot + 1);
  }

  // 🌎 Public Methods

  /**
   * Validates every option and returns the plan a graph command runs.
   * @throws RenderOptionsError naming the first option that cannot be used.
   */
  plan({
    entities,
    filter,
    limit,
    outputJson,
    outputMarkdown,
    overwrite,
    page,
    schema,
    sort,
    sourceUri,
    table,
    truncateBreadth,
    truncateDepth,
  }: GraphOptions): GraphPlan {
    if (sourceUri === undefined) {
      throw new RenderOptionsError(RENDER_OPTION_MESSAGES.sourceUri);
    }
    if (entities === undefined) {
      throw new RenderOptionsError(RENDER_OPTION_MESSAGES.entities);
    }
    if (schema === undefined) {
      throw new RenderOptionsError(RENDER_OPTION_MESSAGES.schema);
    }

    const { connection, source } = parseGraphSource(sourceUri, schema);
    const { filters, sorts } = parseGraphRows(filter, sort);

    return {
      connection,
      entities,
      filters,
      outputs: resolveGraphOutputs({
        json: outputJson,
        markdown: outputMarkdown,
        overwrite,
      }),
      paging: parseGraphPaging(page, limit),
      sorts,
      source,
      table: this.tableName(table, schema),
      truncateBreadth: positiveIntegerFlag(
        "--truncate-breadth",
        truncateBreadth,
      ),
      truncateDepth: positiveIntegerFlag("--truncate-depth", truncateDepth),
    };
  }
}
