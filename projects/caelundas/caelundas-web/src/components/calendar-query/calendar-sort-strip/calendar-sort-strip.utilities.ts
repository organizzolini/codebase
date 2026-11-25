import { createElement } from "react";

import { METRIC_CATALOG } from "../../calendar-display/calendar-metrics/calendar-metrics.constants";
import {
  parseMetrics,
  resolveMetrics,
} from "../../calendar-display/calendar-metrics/calendar-metrics.utilities";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { createGroupItems } from "../calendar-group-strip/calendar-group-strip.utilities";
import {
  getSelectedColumnIds,
  restrictGroupFields,
  restrictSortKeys,
} from "../calendar-select-strip/calendar-select-strip-scope.utilities";
import { TagIcon } from "../tag-icon/tag-icon";

import {
  METRIC_SORT_PREFIX,
  SORT_OPTIONS,
  TAG_SORT_PREFIX,
} from "./calendar-sort-strip.constants";

import type { EventMetric } from "../../../graphql/generated/operations";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupField } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CascaderNode } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔏 Private Functions

/**
 * The keys groups are ordered by, all or those offered.
 */
export function createKeyItems(
  keysOffered?: readonly string[],
): CascaderNode[] {
  return SORT_OPTIONS.filter(
    (option) => keysOffered === undefined || keysOffered.includes(option.key),
  ).map((option) => ({
    description: option.description,
    icon: createElement(TagIcon, { name: option.icon }),
    keywords: [option.label],
    label: option.label,
    value: option.key,
  }));
}

/**
 * The choices the metric layouts offer: the tag order, the name, then each metric measured, which orders the groups by its value.
 */
export function createMetricSortItems(
  metrics: readonly EventMetric[],
): CascaderNode[] {
  return [
    ...createKeyItems(["order", "name"]),
    ...metrics.map((metric) => ({
      description: `By each group's ${METRIC_CATALOG[metric].label.toLowerCase()}.`,
      icon: createElement(TagIcon, { name: METRIC_CATALOG[metric].icon }),
      keywords: [METRIC_CATALOG[metric].label],
      label: METRIC_CATALOG[metric].label,
      value: `${METRIC_SORT_PREFIX}${metric}`,
    })),
  ];
}

/**
 * The nested choices: the keys groups are ordered by, all or those offered, then each tag root with its tags beneath.
 */
export function createSortItems(
  fields: readonly EventGroupField[],
  keysOffered?: readonly string[],
): CascaderNode[] {
  const items = createKeyItems(keysOffered);
  const tags = createGroupItems(
    fields.filter((field) => field.levels.length > 0),
  );

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const item of tags) {
    items.push(prefixTagItem(item));
  }

  return items;
}

/**
 * The choices a view offers: the metric layouts' own, in the table those of the columns selected, else every one.
 */
export function createViewSortItems(
  view: CalendarViewName,
  context: Readonly<{
    columns: readonly string[] | undefined;
    fields: readonly EventGroupField[];
    metrics: readonly EventMetric[] | undefined;
  }>,
): CascaderNode[] {
  if (isMetricView(view)) {
    return createMetricSortItems(resolveMetrics(view, context.metrics));
  }

  if (view !== "table") {
    return createSortItems(context.fields);
  }

  const selected = getSelectedColumnIds(context.columns);

  return createSortItems(
    restrictGroupFields(context.fields, selected),
    restrictSortKeys(selected),
  );
}

// 🌎 Public Functions

/**
 * The same sorts with the one at an index turned the other way round.
 */
export function flipSortAt(
  sorts: readonly GroupSort[],
  index: number,
): GroupSort[] {
  return sorts.map((sort, position) =>
    position === index
      ? { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" }
      : sort,
  );
}

/**
 * The symbol that leads a sort's chip: a metric's own icon, else the sort's.
 */
export function getSortChipIcon(
  sort: GroupSort,
  fields: readonly EventGroupField[],
): ReactNode {
  if (sort.key !== "metric") {
    return getSortIcon(sort, fields);
  }

  const metric = parseMetrics(sort.metric)?.[0];

  return metric === undefined
    ? undefined
    : createElement(TagIcon, { name: METRIC_CATALOG[metric].icon });
}

/**
 * The symbol that leads a sort's chip: its key's icon, or for a tag its row's symbol in the list.
 */
export function getSortIcon(
  sort: GroupSort,
  fields: readonly EventGroupField[],
): ReactNode {
  if (sort.key !== "tag") {
    const option = SORT_OPTIONS.find((candidate) => candidate.key === sort.key);

    return option === undefined
      ? undefined
      : createElement(TagIcon, { name: option.icon });
  }

  for (const field of fields) {
    if (field.id === sort.tag) {
      return field.icon;
    }

    const node = field.nodes.find((candidate) => candidate.id === sort.tag);

    if (node !== undefined) {
      return node.icon;
    }
  }

  return undefined;
}

/**
 * The name a sort's chip shows: its key's, or for a tag its root's, then the tag when it is not the root's own.
 */
export function labelSort(
  sort: GroupSort,
  fields: readonly EventGroupField[],
): string {
  if (sort.key !== "tag") {
    return (
      SORT_OPTIONS.find((option) => option.key === sort.key)?.label ?? sort.key
    );
  }

  for (const field of fields) {
    if (field.id === sort.tag) {
      return field.label;
    }

    const node = field.nodes.find((candidate) => candidate.id === sort.tag);

    if (node !== undefined) {
      return `${field.label} › ${node.name}`;
    }
  }

  return sort.tag ?? sort.key;
}

/**
 * The name a sort's chip shows: a metric's label, else the sort's.
 */
export function labelSortChip(
  sort: GroupSort,
  fields: readonly EventGroupField[],
): string {
  if (sort.key !== "metric") {
    return labelSort(sort, fields);
  }

  const metric = parseMetrics(sort.metric)?.[0];

  return metric === undefined ? "Metric" : METRIC_CATALOG[metric].label;
}

/** The sorts after a list click: sorts still ticked keep their place and direction, newly ticked ones follow, ascending; none means the default. */
export function toSorts(
  next: readonly string[],
  previous: readonly GroupSort[],
): GroupSort[] | undefined {
  const kept = previous.filter((sort) => next.includes(toSortToken(sort)));
  const keptTokens = new Set(kept.map((sort) => toSortToken(sort)));
  const added: GroupSort[] = [];

  for (const token of next) {
    const sort = keptTokens.has(token) ? undefined : parseSortToken(token);

    if (sort !== undefined) {
      added.push(sort);
    }
  }

  const sorts = [...kept, ...added];

  return sorts.length === 0 ? undefined : sorts;
}

/**
 * The values ticked for sorts: one for each.
 */
export function toSortValue(sorts: readonly GroupSort[]): string[] {
  return sorts.map((sort) => toSortToken(sort));
}

/**
 * The sort a ticked value names, ascending, or nothing for a stale value.
 */
function parseSortToken(token: string): GroupSort | undefined {
  if (token.startsWith(METRIC_SORT_PREFIX)) {
    const metric = parseMetrics(token.slice(METRIC_SORT_PREFIX.length))?.[0];

    return metric === undefined
      ? undefined
      : { direction: "asc", key: "metric", metric };
  }

  if (token.startsWith(TAG_SORT_PREFIX)) {
    return {
      direction: "asc",
      key: "tag",
      tag: token.slice(TAG_SORT_PREFIX.length),
    };
  }

  const option = SORT_OPTIONS.find((candidate) => candidate.key === token);

  return option === undefined
    ? undefined
    : { direction: "asc", key: option.key };
}

/**
 * A tag row and the rows beneath it, their values marked as sorting by a tag, so they cannot be taken for a key.
 */
function prefixTagItem(item: CascaderNode): CascaderNode {
  return {
    ...item,
    ...(item.children === undefined
      ? {}
      : { children: item.children.map((child) => prefixTagItem(child)) }),
    value: `${TAG_SORT_PREFIX}${item.value}`,
  };
}

/**
 * A sort's token in the list: its key, or the tag a tag sort ranks by after a prefix.
 */
function toSortToken(sort: GroupSort): string {
  if (sort.key === "metric") {
    return `${METRIC_SORT_PREFIX}${sort.metric ?? ""}`;
  }

  return sort.key === "tag" ? `${TAG_SORT_PREFIX}${sort.tag ?? ""}` : sort.key;
}
