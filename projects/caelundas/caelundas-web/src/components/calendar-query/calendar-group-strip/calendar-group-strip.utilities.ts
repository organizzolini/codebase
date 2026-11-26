import { createElement } from "react";

import { NONE_OPEN } from "../../../hooks/use-metric-layout/use-metric-layout.constants";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { listOfferedValues } from "../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { TAG_FIELD_PREFIX } from "../calendar-filters/components/event-filter-model/event-filters.constants";
import { TagIcon } from "../tag-icon/tag-icon";

import {
  describeTagItems,
  nestTagItems,
  pickCandidates,
  toFieldItem,
  toTagItemRows,
} from "./calendar-group-strip-items.utilities";
import { COLOR_HINT, GROUP_MENU } from "./calendar-group-strip.constants";
import { ALL_TAGS_FIELD } from "./components/event-group-model/event-group-fields.constants";
import {
  getRootGrouping,
  resolveEventGrouping,
} from "./components/event-group-model/event-group-fields.utilities";

import type { TableGroupsValue } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { EventFacetValue } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { TagItemsMenu } from "./calendar-group-strip.types";
import type {
  EventGroupField,
  EventGroupLevel,
} from "./components/event-group-model/event-groups.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * The nested choices: a Tag row holding each tag root with the tags the menu offers beneath it, then each derived field.
 */
export function createGroupItems(
  fields: readonly EventGroupField[],
  menu: Readonly<TagItemsMenu> = GROUP_MENU,
): CascaderNode[] {
  const roots: CascaderNode[] = [];
  const derived: CascaderNode[] = [];

  // Loops rather than callbacks keep the call stacks shallow; every callee is a leaf.
  for (const field of fields) {
    const offered = listOfferedValues(
      pickCandidates(field.values, menu.leaves),
      menu.flag,
    );
    const children = nestTagItems(
      toTagItemRows(offered, describeTagItems(offered), menu.leaves),
      menu.leaves,
    );
    const item = toFieldItem(field, children, menu.flag);

    if (item !== undefined) {
      (field.id.startsWith(TAG_FIELD_PREFIX) ? roots : derived).push(item);
    }
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

  if (level.tags !== undefined && field !== undefined) {
    return nameTags(label, field.values, level.tags);
  }

  return parent === undefined ? label : `${label} › ${parent.name}`;
}

/** The grouping the ticked values mean: kept levels keep their place, new ones follow, senseless ones drop, up to the maximum. */
export function toGrouping(
  value: readonly string[],
  grouping: readonly EventGroupLevel[],
  fields: readonly EventGroupField[],
): EventGroupLevel[] {
  return resolveEventGrouping(
    placeLevels(wantLevels(value, fields), grouping),
    fields,
  );
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
    if (level.tags === undefined) {
      value.push(level.parent ?? level.field);
    } else {
      value.push(...level.tags);
    }
  }

  return value;
}

/**
 * The index of the last level of a field, or -1 when it has none.
 */
function lastOfField(
  levels: readonly EventGroupLevel[],
  field: string,
): number {
  let last = -1;

  // A loop rather than a callback keeps the call stacks shallow.
  for (const [index, level] of levels.entries()) {
    if (level.field === field) {
      last = index;
    }
  }

  return last;
}

/**
 * What tells one level from another: its field and parent, and whether it picks tags.
 */
function levelKey(level: EventGroupLevel): string {
  return `${level.field}|${level.parent ?? ""}${level.tags === undefined ? "" : "|*"}`;
}

/**
 * The label, then the names of the tags found.
 */
function nameTags(
  label: string,
  values: readonly EventFacetValue[],
  tags: readonly string[],
): string {
  const names = new Set<string>();

  // A loop rather than a callback keeps the call stacks shallow.
  for (const value of values) {
    if (tags.includes(value.id)) {
      names.add(value.name);
    }
  }

  return names.size === 0 ? label : `${label} › ${[...names].join(", ")}`;
}

/**
 * The ticked tags of a field with none beneath them, in tree order.
 */
function pickTags(
  field: EventGroupField,
  ticked: ReadonlySet<string>,
): string[] {
  const branches = new Set<string>();
  const tags: string[] = [];

  // Loops rather than callbacks keep the call stacks shallow.
  for (const node of field.nodes) {
    branches.add(node.id);
  }

  for (const value of field.values) {
    if (
      ticked.has(value.id) &&
      !branches.has(value.id) &&
      !tags.includes(value.id)
    ) {
      tags.push(value.id);
    }
  }

  return tags;
}

/**
 * Keeps wanted levels in place; a new one follows its field's last, or goes last.
 */
function placeLevels(
  wanted: ReadonlyMap<string, EventGroupLevel>,
  grouping: readonly EventGroupLevel[],
): EventGroupLevel[] {
  const kept: EventGroupLevel[] = [];
  const keptKeys = new Set<string>();

  for (const level of grouping) {
    const key = levelKey(level);
    const next = wanted.get(key);

    if (next !== undefined) {
      kept.push(next);
      keptKeys.add(key);
    }
  }

  for (const [key, level] of wanted) {
    if (!keptKeys.has(key)) {
      const last = lastOfField(kept, level.field);

      kept.splice(last === -1 ? kept.length : last + 1, 0, level);
    }
  }

  return kept;
}

/**
 * The levels the ticked values ask for, by key.
 */
function wantLevels(
  value: readonly string[],
  fields: readonly EventGroupField[],
): Map<string, EventGroupLevel> {
  const ticked = new Set(value);
  const wanted = new Map<string, EventGroupLevel>();

  for (const field of fields) {
    // The tags ticked that no tag lies beneath are one level's groups, in place of the root's own.
    const tags = pickTags(field, ticked);

    if (tags.length > 0) {
      wanted.set(`${field.id}||*`, { field: field.id, tags });
    } else if (ticked.has(field.id)) {
      wanted.set(`${field.id}|`, { field: field.id });
    }

    for (const node of field.nodes) {
      if (ticked.has(node.id)) {
        wanted.set(`${field.id}|${node.id}`, {
          field: field.id,
          parent: node.id,
        });
      }
    }
  }

  return wanted;
}
