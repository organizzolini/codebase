import { Inject, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";

import { MetricExpression } from "@codebase/caelundas-db";

import { EventsService } from "../../../../events.service";
import { EVENT_ROW_COLUMNS } from "../measures/event-metrics-measures.constants";

import {
  measureRowSchema,
  MEASURES_SQL,
  metricRowDataSchema,
  METRICS_SQL,
} from "./event-metrics-catalog.constants";
import {
  buildCatalog,
  describeCatalog,
  flattenExpressionTrees,
} from "./event-metrics-catalog.utilities";

import type { EventMetricCatalogEntity } from "./event-metrics-catalog.entities";
import type { MetricCatalog } from "./event-metrics-catalog.types";
import type { EntityManager } from "typeorm";

/**
 * Loads the measures, the metrics and their expression trees from the
 * database, validated against the columns an event row has, and
 * keeps them in memory: they are reference data a migration seeds, so they
 * are read once, and again on `reload`.
 */
@Injectable()
export class EventMetricsCatalogService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventsService) private readonly eventsService: EventsService,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  // 🔐 Private Fields

  private loading: null | Promise<MetricCatalog> = null;

  // 🔏 Private Methods

  /**
   * Reads the measures, metrics and expression trees, and builds the catalog.
   */
  private async load(): Promise<MetricCatalog> {
    const [measures, metrics, expressions] = await Promise.all([
      this.eventsService.select(MEASURES_SQL, [], measureRowSchema),
      this.eventsService.select(METRICS_SQL, [], metricRowDataSchema),
      this.manager.getTreeRepository(MetricExpression).findTrees(),
    ]);

    return buildCatalog({
      eventColumns: EVENT_ROW_COLUMNS,
      expressions: flattenExpressionTrees(expressions),
      measures,
      metrics,
    });
  }

  // 🌎 Public Methods

  /**
   * The catalog as the GraphQL query answers it.
   */
  public async describe(): Promise<EventMetricCatalogEntity> {
    return describeCatalog(await this.getCatalog());
  }

  /**
   * The catalog, loaded on first use and kept; a load that failed is tried
   * again on the next call.
   */
  public async getCatalog(): Promise<MetricCatalog> {
    this.loading ??= this.load().catch((error: unknown) => {
      this.loading = null;

      throw error;
    });

    return this.loading;
  }

  /**
   * Forgets the catalog, so the next call reads the tables again.
   */
  public reload(): void {
    this.loading = null;
  }
}
