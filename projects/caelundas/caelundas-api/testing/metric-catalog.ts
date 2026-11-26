import { MetricExpression } from "@codebase/caelundas-db";

import { DEFAULT_EVENT_SCOPE } from "../src/modules/events/modules/filtering/event-filter.constants";
import { buildCatalog } from "../src/modules/events/modules/metrics/modules/catalog/event-metrics-catalog.utilities";

import type { EventMetricsQueryRequest } from "../src/modules/events/modules/metrics/event-metrics.types";
import type {
  CatalogMetric,
  ExpressionRow,
  MeasureRow,
  MetricCatalog,
  MetricCatalogRows,
  MetricRow,
} from "../src/modules/events/modules/metrics/modules/catalog/event-metrics-catalog.types";

/** An expression tree as the fixture writes it. */
type Tree = { m: string } | { o: string; operands: Tree[] } | { t: string };

/** Every column of an event row the registry's measures read. */
export const FIXTURE_VIEW_COLUMNS: ReadonlySet<string> = new Set([
  "ancestor_tag_ids",
  "covered_range",
  "day",
  "duration_minutes",
  "events",
  "first_start",
  "last_start",
  "perfective_events",
  "progressive_events",
  "tag_ids",
]);

/** A measure row: the catalog's part of a measure, the rest being code. */
function measure(slug: string, unit: MeasureRow["unit"]): MeasureRow {
  return { icon: "hash", id: `m-${slug}`, name: slug, note: slug, slug, unit };
}

/** The measures the seeded metrics read. */
const MEASURES: MeasureRow[] = [
  measure("events", "count"),
  measure("perfective-events", "count"),
  measure("progressive-events", "count"),
  measure("days-with-events", "count"),
  measure("unique-names", "count"),
  measure("unique-tags", "count"),
  measure("duration", "duration"),
  measure("covered-duration", "duration"),
  measure("longest-progressive-duration", "duration"),
  measure("shortest-progressive-duration", "duration"),
  measure("median-progressive-duration", "duration"),
  measure("first-start", "instant"),
  measure("last-start", "instant"),
  measure("period-length", "duration"),
  measure("clipped-duration", "duration"),
  measure("covered-clipped-duration", "duration"),
  measure("progressive-clipped-duration", "duration"),
  measure("progressive-covered-clipped-duration", "duration"),
];

/** A percent of the period a measure's minutes make. */
function percent(slug: string): Tree {
  return { o: "percent", operands: [{ m: slug }, { m: "period-length" }] };
}

/** The metrics, each with its unit and its tree. */
const METRICS: {
  slug: string;
  tree: Tree;
  unit: MetricRow["unit"];
}[] = [
  { slug: "events", tree: { m: "events" }, unit: "count" },
  { slug: "unique-names", tree: { m: "unique-names" }, unit: "count" },
  { slug: "unique-tags", tree: { m: "unique-tags" }, unit: "count" },
  {
    slug: "days-with-events",
    tree: { m: "days-with-events" },
    unit: "count",
  },
  {
    slug: "perfective-events",
    tree: { m: "perfective-events" },
    unit: "count",
  },
  {
    slug: "progressive-events",
    tree: { m: "progressive-events" },
    unit: "count",
  },
  {
    slug: "duration",
    tree: { m: "duration" },
    unit: "duration",
  },
  {
    slug: "covered-duration",
    tree: { m: "covered-duration" },
    unit: "duration",
  },
  {
    slug: "average-duration",
    tree: {
      o: "divide",
      operands: [{ t: "duration" }, { m: "progressive-events" }],
    },
    unit: "duration",
  },
  {
    slug: "median-duration",
    tree: { m: "median-progressive-duration" },
    unit: "duration",
  },
  {
    slug: "longest-duration",
    tree: { m: "longest-progressive-duration" },
    unit: "duration",
  },
  {
    slug: "shortest-duration",
    tree: { m: "shortest-progressive-duration" },
    unit: "duration",
  },
  {
    slug: "covered-percent",
    tree: percent("covered-clipped-duration"),
    unit: "none",
  },
  {
    slug: "total-time-percent",
    tree: percent("clipped-duration"),
    unit: "none",
  },
  {
    slug: "progressive-covered-percent",
    tree: percent("progressive-covered-clipped-duration"),
    unit: "none",
  },
  {
    slug: "progressive-total-percent",
    tree: percent("progressive-clipped-duration"),
    unit: "none",
  },
  { slug: "first-start", tree: { m: "first-start" }, unit: "instant" },
  { slug: "last-start", tree: { m: "last-start" }, unit: "instant" },
];

/** The seeded metrics' slugs, in the picker's order. */
export const SEEDED_METRIC_SLUGS: string[] = METRICS.map(({ slug }) => slug);

/** A request's parts, its metrics given as slugs. */
export type RequestParts = Omit<
  Partial<EventMetricsQueryRequest>,
  "metrics"
> & {
  metrics?: string[];
};

/** A request for March over the seeded catalog, with the parts given changed. */
export function createRequest(
  rest: RequestParts = {},
): EventMetricsQueryRequest {
  const catalog = createSeedCatalog();
  const { metrics = ["events"], ...parts } = rest;

  return {
    catalog,
    filter: null,
    grouping: [],
    metrics: seedMetrics(catalog, ...metrics),
    period: {
      end: "2026-04-01T00:00:00.000Z",
      start: "2026-03-01T00:00:00.000Z",
    },
    previous: null,
    scope: DEFAULT_EVENT_SCOPE,
    tagRoot: null,
    ...parts,
  };
}

/** The catalog the migration seeds, built the way the service builds it. */
export function createSeedCatalog(): MetricCatalog {
  return buildCatalog(createSeedRows());
}

/** The rows the migration seeds, as the service reads them. */
export function createSeedRows(): MetricCatalogRows {
  const { roots, rows } = toExpressionRows();

  return {
    eventColumns: FIXTURE_VIEW_COLUMNS,
    expressions: rows,
    measures: structuredClone(MEASURES),
    metrics: toMetricRows(roots),
  };
}

/** The expression rows as the tree repository returns them: roots, nested. */
export function createSeedTrees(): MetricExpression[] {
  const nodes = new Map<string, MetricExpression>();
  const roots: MetricExpression[] = [];

  for (const row of toExpressionRows().rows) {
    nodes.set(
      row.id,
      Object.assign(new MetricExpression(), {
        children: [],
        id: row.id,
        kind: row.kind,
        measureId: row.measure_id,
        metricId: row.metric_id,
        operator: row.operator,
        parentId: row.parent_id,
        position: row.position,
      }),
    );
  }

  for (const node of nodes.values()) {
    const parent = nodes.get(node.parentId ?? "");

    (parent?.children ?? roots).push(node);
  }

  return roots;
}

/** The seeded metrics the slugs name, in order. */
export function seedMetrics(
  catalog: MetricCatalog,
  ...slugs: string[]
): CatalogMetric[] {
  return slugs.map((slug) => {
    const metric = catalog.metrics.get(slug);

    if (metric === undefined) {
      throw new Error(`No seeded metric ${slug}`);
    }

    return metric;
  });
}

/** The rows of the expression table: every tree flattened to its nodes. */
function toExpressionRows(): {
  roots: Map<string, string>;
  rows: ExpressionRow[];
} {
  const rows: ExpressionRow[] = [];
  const roots = new Map<string, string>();

  /** Adds a node and, beneath it, its operands. */
  function add(tree: Tree, parent: null | string, position: number): string {
    const id = `e${String(rows.length)}`;
    const row: ExpressionRow = {
      id,
      kind: "measure",
      measure_id: null,
      metric_id: null,
      operator: null,
      parent_id: parent,
      position,
    };

    rows.push(row);

    if ("m" in tree) {
      row.measure_id = `m-${tree.m}`;
    } else if ("t" in tree) {
      Object.assign(row, { kind: "metric", metric_id: `t-${tree.t}` });
    } else {
      Object.assign(row, { kind: "operator", operator: tree.o });

      for (const [index, operand] of tree.operands.entries()) {
        add(operand, id, index);
      }
    }

    return id;
  }

  for (const { slug, tree } of METRICS) {
    roots.set(slug, add(tree, null, 0));
  }

  return { roots, rows };
}

/** The rows of the metrics table, each naming its tree's root node. */
function toMetricRows(roots: ReadonlyMap<string, string>): MetricRow[] {
  return METRICS.map(({ slug, unit }) => ({
    expression_id: roots.get(slug) ?? null,
    icon: "hash",
    id: `t-${slug}`,
    name: slug,
    note: slug,
    slug,
    unit,
  }));
}
