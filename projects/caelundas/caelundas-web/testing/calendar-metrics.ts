import type {
  EventMetric,
  EventMetricsInput,
  EventMetricsQuery,
} from "../src/graphql/generated/operations";

// A small consistent tree for the mocked API: groups of 6 and 4 events, each split in two (4 and 2, 3 and 1); two levels answer the first two, and a grouping of exactly three levels also splits Alpha's first group (3 and 1).

/**
 * What the metrics query answers.
 */
type Answer = EventMetricsQuery["eventMetrics"];
/**
 * A group of the tree and its share of ten events.
 */
interface Share {
  id: string;
  label: string;
  parts: readonly Share[];
  share: number;
}

/**
 * One metric's value in the answer.
 */
type Value = Answer["total"][number];

const DEEP_GROUPING = 3;

const FIRST_START_MILLISECONDS = Date.UTC(2026, 2, 1, 12);

const TREE: readonly Share[] = [
  {
    id: "/0:alpha",
    label: "Alpha",
    parts: [
      {
        id: "/0:alpha/1:one",
        label: "One",
        parts: [
          { id: "/0:alpha/1:one/2:deep", label: "Deep", parts: [], share: 3 },
          { id: "/0:alpha/1:one/2:more", label: "More", parts: [], share: 1 },
        ],
        share: 4,
      },
      { id: "/0:alpha/1:two", label: "Two", parts: [], share: 2 },
    ],
    share: 6,
  },
  {
    id: "/0:beta",
    label: "Beta",
    parts: [
      { id: "/0:beta/1:one", label: "One", parts: [], share: 3 },
      { id: "/0:beta/1:two", label: "Two", parts: [], share: 1 },
    ],
    share: 4,
  },
];

/**
 * The metrics the mocked API answers for a request: the total and a group per level asked.
 */
export function findMetrics(input: EventMetricsInput): Answer {
  const asked = input.grouping?.length ?? 0;
  const levels = asked === DEEP_GROUPING ? DEEP_GROUPING : Math.min(asked, 2);
  const compare = input.compareToPrevious === true;

  return {
    groups:
      levels === 0 ? [] : TREE.map((part) => toGroup(part, input, levels)),
    timezone: "America/New_York",
    total: toValues(input.metrics, { compare, share: 10 }),
  };
}

/**
 * A group of the tree and the subgroups beneath it down to the levels asked.
 */
function toGroup(
  part: Share,
  input: EventMetricsInput,
  levels: number,
): Answer["groups"][number] {
  const compare = input.compareToPrevious === true;
  const level = part.id.split("/").length - 2;
  const key = part.id.split(":").at(-1) ?? "";

  return {
    children:
      level + 1 < levels
        ? part.parts.map((child) => toGroup(child, input, levels))
        : [],
    id: part.id,
    key,
    label: part.label,
    level,
    orderKey: key,
    path: null,
    values: toValues(input.metrics, { compare, share: part.share }),
  };
}

/**
 * A metric's number for a share of the events, one less before when compared.
 */
function toValue(
  metric: EventMetric,
  options: Readonly<{ compare: boolean; share: number }>,
): Value {
  const value =
    metric === "FIRST_START"
      ? FIRST_START_MILLISECONDS
      : metric === "LAST_START"
        ? FIRST_START_MILLISECONDS + 86_400_000
        : options.share * (metric === "EVENTS" ? 1 : 2);

  return {
    metric,
    previous: options.compare ? Math.max(0, value - 1) : null,
    value,
  };
}

/**
 * The values of every metric asked for a share of the events.
 */
function toValues(
  metrics: readonly EventMetric[],
  options: Readonly<{ compare: boolean; share: number }>,
): Value[] {
  return metrics.map((metric) => toValue(metric, options));
}
