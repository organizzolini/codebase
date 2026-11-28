import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Metric, MetricExpression } from "@codebase/caelundas-db";

import { MetricExpressionsCheckError } from "./metric-expressions.constants";
import {
  buildMetricExpressionTrees,
  spliceMetricExpressionsMarkdown,
} from "./metric-expressions.utilities";

import type {
  MetricExpressionsSync,
  MetricExpressionTree,
} from "./metric-expressions.types";

/**
 * Draws the metrics' expression trees from the database: a Mermaid flowchart
 * per metric and a table of the expressions in infix form, kept in a marker
 * block of a Markdown file.
 */
@Injectable()
export class MetricExpressionsService {
  // 🏗 Dependency Injection

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads every metric and its expression tree, ordered by slug. */
  async read(): Promise<MetricExpressionTree[]> {
    const [metrics, expressions] = await Promise.all([
      this.dataSource.getRepository(Metric).find(),
      this.dataSource.getRepository(MetricExpression).find({
        relations: { measure: true, metric: true },
      }),
    ]);

    return buildMetricExpressionTrees(metrics, expressions);
  }

  /**
   * Writes the marker block from the database; with `check`, only fails when
   * it differs.
   * @throws MetricExpressionsCheckError when `check` finds the file stale.
   */
  async sync({ check, outputMarkdown }: MetricExpressionsSync): Promise<void> {
    const current = fs.existsSync(outputMarkdown)
      ? fs.readFileSync(outputMarkdown, "utf8")
      : undefined;
    const next = spliceMetricExpressionsMarkdown(current, await this.read());

    if (!check) {
      fs.writeFileSync(outputMarkdown, next);
      return;
    }
    if (current !== next) {
      throw new MetricExpressionsCheckError(
        `--check found a stale output file: ${outputMarkdown}`,
      );
    }
  }
}
