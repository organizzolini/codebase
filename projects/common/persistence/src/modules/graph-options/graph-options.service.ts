import { Injectable } from "@nestjs/common";

import {
  maskPostgresCredentials,
  parsePostgresUri,
} from "../postgresql-utilities/postgresql-utilities.utilities";

import {
  GRAPH_OPTION_MESSAGES,
  GraphOptionsError,
  graphTableSchemaMessage,
} from "./graph-options.constants";
import {
  parseGraphPaging,
  parseGraphRows,
  positiveIntegerFlag,
} from "./graph-options.utilities";

import type { GraphOptions, GraphPlan } from "./graph-options.types";

/**
 * Validates the connection and entity options every graph command shares,
 * before any entity file is imported or any database is reached.
 */
@Injectable()
export class GraphOptionsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The table name `--table` names, with a schema qualifier reduced to the
   * name when it is `schema`.
   * @throws GraphOptionsError when the qualifier names another schema.
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
      throw new GraphOptionsError(graphTableSchemaMessage(table, schema));
    }
    return table.slice(dot + 1);
  }

  // 🌎 Public Methods

  /**
   * Validates every option and returns the plan a graph command runs.
   * @throws GraphOptionsError naming the first option that cannot be used.
   */
  plan({
    entities,
    filter,
    limit,
    maxBreadth: maximumBreadth,
    maxDepth: maximumDepth,
    page,
    schema,
    sort,
    sourceUri,
    table,
  }: GraphOptions): GraphPlan {
    if (sourceUri === undefined) {
      throw new GraphOptionsError(GRAPH_OPTION_MESSAGES.sourceUri);
    }
    if (entities === undefined) {
      throw new GraphOptionsError(GRAPH_OPTION_MESSAGES.entities);
    }
    if (schema === undefined) {
      throw new GraphOptionsError(GRAPH_OPTION_MESSAGES.schema);
    }

    const connection = parsePostgresUri(sourceUri, "--source-uri");
    const { filters, sorts } = parseGraphRows(filter, sort);

    return {
      connection: { ...connection, schema },
      entities,
      filters,
      maximumBreadth: positiveIntegerFlag("--max-breadth", maximumBreadth),
      maximumDepth: positiveIntegerFlag("--max-depth", maximumDepth),
      paging: parseGraphPaging(page, limit),
      sorts,
      source: maskPostgresCredentials(sourceUri, connection.password),
      table: this.tableName(table, schema),
    };
  }
}
