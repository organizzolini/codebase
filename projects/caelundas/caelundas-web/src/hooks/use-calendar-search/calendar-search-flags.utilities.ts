import type { TagMenuFlag } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  EventFilterQuery,
  EventFilterRule,
} from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupLevel,
} from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarSearch } from "./calendar-search.types";

// 🔏 Private Functions

/**
 * The columns without the unoffered ones, none for the defaults; the same list when none was left out.
 */
export function cleanColumns(
  columns: readonly string[] | undefined,
  unoffered: ReadonlySet<string>,
): readonly string[] | undefined {
  const kept: string[] = [];

  for (const column of columns ?? []) {
    if (!unoffered.has(column)) {
      kept.push(column);
    }
  }

  if (columns === undefined || isSame(kept, columns)) {
    return columns;
  }

  return kept.length === 0 ? undefined : kept;
}

/**
 * The filter without the unoffered tags its rules pick, a rule left with none dropped; the same filter when none was left out.
 */
export function cleanFilter(
  filter: EventFilterQuery | undefined,
  unoffered: ReadonlySet<string>,
): EventFilterQuery | undefined {
  if (filter === undefined) {
    return filter;
  }

  const rules = keepNodes(filter.rules, unoffered);

  return isSame(rules, filter.rules) ? filter : { ...filter, rules };
}

/**
 * The grouping without the levels that name an unoffered tag and keep none of their picks; the same list when none was left out.
 */
export function cleanGrouping(
  grouping: EventGrouping | undefined,
  unoffered: ReadonlySet<string>,
): EventGrouping | undefined {
  const kept: EventGroupLevel[] = [];

  for (const level of grouping ?? []) {
    const next = keepLevel(level, unoffered);

    if (next !== undefined) {
      kept.push(next);
    }
  }

  return grouping === undefined || isSame(kept, grouping) ? grouping : kept;
}

/**
 * The sorts without those by an unoffered tag, none when all went; the same list when none was left out.
 */
export function cleanSorts(
  sorts: readonly GroupSort[] | undefined,
  unoffered: ReadonlySet<string>,
): readonly GroupSort[] | undefined {
  const kept: GroupSort[] = [];

  for (const sort of sorts ?? []) {
    if (!isUnofferedSort(sort, unoffered)) {
      kept.push(sort);
    }
  }

  if (sorts === undefined || isSame(kept, sorts)) {
    return sorts;
  }

  return kept.length === 0 ? undefined : kept;
}

/**
 * What the link changes to drop the tags a menu leaves out; nothing when none is named.
 */
export function dropUnofferedTags(
  search: Readonly<CalendarSearch>,
  fields: readonly EventGroupField[],
): Partial<CalendarSearch> | undefined {
  const clean = {
    columns: cleanColumns(
      search.columns,
      listUnoffered(fields, "isSelectable"),
    ),
    filter: cleanFilter(search.filter, listUnoffered(fields, "isFilterable")),
    group: cleanGrouping(search.group, listUnoffered(fields, "isGroupable")),
    sort: cleanSorts(search.sort, listUnoffered(fields, "isSortable")),
  };
  const change: Partial<CalendarSearch> = {};

  for (const key of ["columns", "filter", "group", "sort"] as const) {
    if (clean[key] !== search[key]) {
      Object.assign(change, { [key]: clean[key] });
    }
  }

  return Object.keys(change).length === 0 ? undefined : change;
}

/**
 * Whether two lists hold the same items in the same places.
 */
function isSame(left: readonly unknown[], right: readonly unknown[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (const [index, item] of left.entries()) {
    if (item !== right[index]) {
      return false;
    }
  }

  return true;
}

/**
 * Whether a sort is by a tag the Sort menu leaves out.
 */
function isUnofferedSort(
  sort: GroupSort,
  unoffered: ReadonlySet<string>,
): boolean {
  return sort.key === "tag" && unoffered.has(sort.tag ?? "");
}

// 🌎 Public Functions

/**
 * A level without the tags the menu leaves out, or nothing when it names only such tags.
 */
function keepLevel(
  level: EventGroupLevel,
  unoffered: ReadonlySet<string>,
): EventGroupLevel | undefined {
  if (unoffered.has(level.field) || unoffered.has(level.parent ?? "")) {
    return undefined;
  }

  if (level.tags === undefined) {
    return level;
  }

  const tags = keepPicks(level.tags, unoffered);

  if (tags.length === 0) {
    return undefined;
  }

  return tags === level.tags ? level : { ...level, tags };
}

/**
 * The nodes without unoffered picks; a rule or group left empty goes.
 */
function keepNodes(
  nodes: EventFilterQuery["rules"],
  unoffered: ReadonlySet<string>,
): EventFilterQuery["rules"] {
  const kept: EventFilterQuery["rules"][number][] = [];

  for (const node of nodes) {
    if (node.type === "group") {
      const rules = keepNodes(node.rules, unoffered);

      if (rules.length > 0 || node.rules.length === 0) {
        kept.push(isSame(rules, node.rules) ? node : { ...node, rules });
      }
    } else {
      const rule = keepRule(node, unoffered);

      if (rule !== undefined) {
        kept.push(rule);
      }
    }
  }

  return kept;
}

/**
 * The picks without the unoffered ones; the same list when none was left out.
 */
function keepPicks<Pick extends null | number | string>(
  picks: readonly Pick[],
  unoffered: ReadonlySet<string>,
): readonly Pick[] {
  const kept: Pick[] = [];

  for (const pick of picks) {
    if (typeof pick !== "string" || !unoffered.has(pick)) {
      kept.push(pick);
    }
  }

  return kept.length === picks.length ? picks : kept;
}

/**
 * A rule without the unoffered tags it picks, or nothing when it had picks and none are left.
 */
function keepRule(
  rule: EventFilterRule,
  unoffered: ReadonlySet<string>,
): EventFilterRule | undefined {
  if (!Array.isArray(rule.value)) {
    return rule;
  }

  const value = keepPicks<null | number | string>(rule.value, unoffered);

  if (value.length === 0 && rule.value.length > 0) {
    return undefined;
  }

  return value === rule.value ? rule : { ...rule, value: [...value] };
}

/**
 * The ids of the tags a menu leaves out, the roots as their `tag:` field too.
 */
function listUnoffered(
  fields: readonly EventGroupField[],
  flag: TagMenuFlag,
): Set<string> {
  const unoffered = new Set<string>();

  for (const field of fields) {
    if (!field.menus[flag]) {
      unoffered.add(field.id);
    }

    for (const value of field.values) {
      if (value[flag] === false) {
        unoffered.add(value.id);
      }
    }
  }

  return unoffered;
}
