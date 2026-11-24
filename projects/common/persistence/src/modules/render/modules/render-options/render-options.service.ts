import { Injectable } from "@nestjs/common";

import { resolveGraphOutputs } from "./render-options-outputs.utilities";
import {
  RenderOptionsError,
  renderOptionsTableSchemaMessage,
} from "./render-options.constants";
import {
  parseGraphDrawing,
  parseGraphPaging,
  parseGraphRows,
  parseGraphSource,
  requireGraphOptions,
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
    diagram,
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
    const required = requireGraphOptions({ entities, schema, sourceUri });
    const { connection, source } = parseGraphSource(
      required.sourceUri,
      required.schema,
    );
    const { filters, sorts } = parseGraphRows(filter, sort);
    const drawing = parseGraphDrawing({
      diagram,
      truncateBreadth,
      truncateDepth,
    });

    return {
      connection,
      entities: required.entities,
      filters,
      outputs: resolveGraphOutputs({
        json: outputJson,
        markdown: outputMarkdown,
        overwrite,
      }),
      paging: parseGraphPaging(page, limit),
      sorts,
      source,
      table: this.tableName(table, required.schema),
      ...drawing,
    };
  }
}
