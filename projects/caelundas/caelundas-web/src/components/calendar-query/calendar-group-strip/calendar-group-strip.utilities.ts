import { createElement } from "react";

import { NONE_OPEN } from "../../../hooks/use-metric-layout/use-metric-layout.constants";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { TAG_FIELD_PREFIX } from "../calendar-filters/components/event-filter-model/event-filters.constants";
import { TagIcon } from "../tag-icon/tag-icon";

import { COLOR_HINT } from "./calendar-group-strip.constants";
import { ALL_TAGS_FIELD } from "./components/event-group-model/event-group-fields.constants";
import {
  getRootGrouping,
  resolveEventGrouping,
} from "./components/event-group-model/event-group-fields.utilities";

import type { TableGroupsValue } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type {
  EventGroupField,
  EventGroupLevel,
  GroupNodeOption,
} from "./components/event-group-model/event-groups.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * The nested choices: a Tag row holding each tag root, with its tags that have tags beneath them, then each derived field.
 */
export function createGroupItems(
  fields: readonly EventGroupField[],
): CascaderNode[] {
  const roots: CascaderNode[] = [];
  const derived: CascaderNode[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const field of fields) {
    const children = nestNodes(field.nodes);

    (field.id.startsWith(TAG_FIELD_PREFIX) ? roots : derived).push({
      ...(children.length === 0 ? {} : { children }),
      description: field.description,
      ...(field.icon === undefined ? {} : { icon: field.icon }),
      keywords: [field.label],
      label: field.label,
      value: field.id,
    });
  }

  return roots.length === 0 ? derived : [createTagParent(roots), ...derived];
}

/**
 * The row above the tag roots: the tags as a whole, which picks the default.
 */
export function createTagParent(roots: CascaderNode[]): CascaderNode {
  return {
    children: roots,
    description: "Every tag root, in order.",
    icon: createElement(TagIcon, { name: "tags" }),
    keywords: ["tags"],
    label: "Tag",
    value: ALL_TAGS_FIELD,
  };
}

// 🌎 Public Functions

/** What a chip's menu offers for its run's levels: collapse all, expand all, in the table and timeline. */
export function getCollapseHandlers(
  view: CalendarViewName,
  groups: TableGroupsValue,
  levels: readonly number[],
): {
  onCollapseAll: (() => void) | undefined;
  onExpandAll: (() => void) | undefined;
} {
  const hasGroups = hasGroupRows(view);
  // The Charts and Totals show only the top-level groups until a group is toggled, whatever lazy first path the state holds.
  const base =
    isMetricView(view) && !groups.state.touched ? NONE_OPEN : undefined;

  return {
    onCollapseAll:
      hasGroups && groups.canCollapse(levels, base)
        ? () => {
            groups.collapseAll(levels, base);
          }
        : undefined,
    onExpandAll:
      hasGroups && groups.canExpand(levels, base)
        ? () => {
            groups.expandAll(levels, base);
          }
        : undefined,
  };
}

/**
 * What the strip says where the first group only colors: the month, week and day have no rows to section.
 */
export function getGroupHint(view: CalendarViewName): string | undefined {
  return hasGroupRows(view) ? undefined : COLOR_HINT;
}

/**
 * Whether a view has groups of rows to open and close: the table, the timeline and the metric layouts.
 */
export function hasGroupRows(view: CalendarViewName): boolean {
  return view === "table" || view === "timeline" || isMetricView(view);
}

/** The name a level's chip shows: its field's label, then the tag whose children it groups by when that is not the root's own. */
export function labelGroupLevel(
  level: EventGroupLevel,
  fields: readonly EventGroupField[],
): string {
  const field = fields.find((candidate) => candidate.id === level.field);
  const label = field?.label ?? level.field;
  const parent = field?.nodes.find((node) => node.id === level.parent);

  return parent === undefined ? label : `${label} › ${parent.name}`;
}

/** The grouping the ticked values mean: kept levels keep their place, new ones follow, senseless ones drop, up to the maximum. */
export function toGrouping(
  value: readonly string[],
  grouping: readonly EventGroupLevel[],
  fields: readonly EventGroupField[],
): EventGroupLevel[] {
  const ticked = new Set(value);
  const wanted: EventGroupLevel[] = [];

  for (const field of fields) {
    if (ticked.has(field.id)) {
      wanted.push({ field: field.id });
    }

    for (const node of field.nodes) {
      if (ticked.has(node.id)) {
        wanted.push({ field: field.id, parent: node.id });
      }
    }
  }

  const wantedKeys = new Set(wanted.map((level) => levelKey(level)));
  const kept = grouping.filter((level) => wantedKeys.has(levelKey(level)));
  const keptKeys = new Set(kept.map((level) => levelKey(level)));
  const added = wanted.filter((level) => !keptKeys.has(levelKey(level)));

  return resolveEventGrouping([...kept, ...added], fields);
}

/** The grouping a list click means: none, the default, when the Tag row is newly ticked, else the levels ticked. */
export function toGroupingChange(
  next: readonly string[],
  context: Readonly<{
    fields: readonly EventGroupField[];
    grouping: readonly EventGroupLevel[];
    isDefaultGrouping: boolean;
  }>,
): EventGroupLevel[] {
  const { fields, grouping, isDefaultGrouping } = context;

  if (!isDefaultGrouping && next.includes(ALL_TAGS_FIELD)) {
    return [];
  }

  const levels = toGrouping(
    next.filter((value) => value !== ALL_TAGS_FIELD),
    grouping,
    fields,
  );
  const roots = getRootGrouping(fields);

  // Every tag root and nothing else is the default, which the link leaves out.
  return levels.length === roots.length &&
    levels.every(
      (level, at) => levelKey(level) === levelKey(roots[at] ?? level),
    )
    ? []
    : levels;
}

/** The values ticked for a grouping: each level's tag or root, and the Tag row for the default. */
export function toGroupValue(
  grouping: readonly EventGroupLevel[],
  isDefaultGrouping = false,
): string[] {
  const value: string[] = isDefaultGrouping ? [ALL_TAGS_FIELD] : [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const level of grouping) {
    value.push(level.parent ?? level.field);
  }

  return value;
}

/**
 * What tells one level from another: its field and parent.
 */
function levelKey(level: EventGroupLevel): string {
  return `${level.field}|${level.parent ?? ""}`;
}

/**
 * Nests a tag root's tags with tags beneath them, which come depth first with their depth beneath the root, under the tag above each.
 */
function nestNodes(options: readonly GroupNodeOption[]): CascaderNode[] {
  const roots: CascaderNode[] = [];
  // The last node seen at each depth, which the next one deeper joins.
  const parents: CascaderNode[] = [];
  // A tag under two parents is a branch under each, but a level groups by it once.
  const listed = new Set<string>();

  for (const option of options) {
    if (listed.has(option.id)) {
      continue;
    }

    listed.add(option.id);

    const events = `${String(option.count)} ${option.count === 1 ? "event" : "events"}`;
    const node: CascaderNode = {
      description:
        option.note === undefined ? events : `${option.note} · ${events}`,
      ...(option.icon === undefined ? {} : { icon: option.icon }),
      keywords: [option.name, option.path],
      label: option.name,
      value: option.id,
    };
    const parent = parents[option.depth - 1];

    if (parent === undefined) {
      roots.push(node);
    } else {
      parent.children = [...(parent.children ?? []), node];
    }

    parents[option.depth] = node;
    parents.length = option.depth + 1;
  }

  return roots;
}
