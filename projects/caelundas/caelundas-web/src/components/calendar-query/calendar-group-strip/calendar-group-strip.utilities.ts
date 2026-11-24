import { resolveEventGrouping } from "./components/event-group-model/event-group-fields.utilities";

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
 * The nested choices: each field, with a tag root's tags that have tags beneath them. Each is a thing to group by the children of, so tags with none are not offered.
 */
export function createGroupItems(
  fields: readonly EventGroupField[],
): CascaderNode[] {
  const items: CascaderNode[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const field of fields) {
    const children = nestNodes(field.nodes);

    items.push({
      ...(children.length === 0 ? {} : { children }),
      description: field.description,
      ...(field.icon === undefined ? {} : { icon: field.icon }),
      keywords: [field.label],
      label: field.label,
      value: field.id,
    });
  }

  return items;
}

// 🌎 Public Functions

/** What the chips' menus offer for the table's groups: collapsing all while one is open, expanding all while one is closed, in the table only. */
export function getCollapseHandlers(
  view: CalendarViewName,
  groups: TableGroupsValue,
): {
  onCollapseAll: (() => void) | undefined;
  onExpandAll: (() => void) | undefined;
} {
  const inTable = view === "table";

  return {
    onCollapseAll:
      inTable && groups.canCollapse ? groups.collapseAll : undefined,
    onExpandAll: inTable && groups.canExpand ? groups.expandAll : undefined,
  };
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

/** The grouping ticked values mean: levels already there keep their place, new ones follow in field order, and any that do not make sense together are left out, up to the maximum. */
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

/** The values ticked for a grouping: each level's tag, or its field when it groups by the root's own children. */
export function toGroupValue(grouping: readonly EventGroupLevel[]): string[] {
  const value: string[] = [];

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

  for (const option of options) {
    const node = toCascaderNode(option);
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

/**
 * One tag as a node: its note and count beneath its name, its icon and keywords.
 */
function toCascaderNode(option: GroupNodeOption): CascaderNode {
  const events = `${String(option.count)} ${option.count === 1 ? "event" : "events"}`;

  return {
    description:
      option.note === undefined ? events : `${option.note} · ${events}`,
    ...(option.icon === undefined ? {} : { icon: option.icon }),
    keywords: [option.name, option.path],
    label: option.name,
    value: option.id,
  };
}
