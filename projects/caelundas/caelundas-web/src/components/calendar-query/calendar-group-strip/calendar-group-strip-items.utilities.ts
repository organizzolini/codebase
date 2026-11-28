import { createElement } from "react";

import { TagLead } from "../../calendar-events/tag-lead/tag-lead";
import {
  EVENT_COUNT_FORMAT,
  EVENT_COUNT_NOUNS,
} from "../calendar-filters/components/event-filter-model/event-filter-fields.constants";
import { TAG_FIELD_PREFIX } from "../calendar-filters/components/event-filter-model/event-filters.constants";
import { TAG_FOLDER } from "../filter-tag-editor/filter-tag-editor.constants";

import { SHARED_SEPARATOR } from "./calendar-group-strip.constants";

import type {
  EventFacetValue,
  OfferedValue,
  TagMenuFlag,
} from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { TagItemRow } from "./calendar-group-strip.types";
import type { EventGroupField } from "./components/event-group-model/event-groups.types";
import type { CascaderNode } from "@codebase/presentation";

// Each function below is a leaf the caller strings together, as a call stack
// beneath the menus has little room.

/**
 * What each offered tag says beneath its name: its note, event count and other parents.
 */
export function describeTagItems(offered: readonly OfferedValue[]): string[] {
  const descriptions: string[] = [];

  for (const { value } of offered) {
    const parents: string[] = [];

    for (const path of value.alsoUnder ?? []) {
      parents.push(path.split(" / ").at(-1) ?? path);
    }

    descriptions.push(
      [
        ...(typeof value.note === "string" ? [value.note] : []),
        `${String(value.count)} ${EVENT_COUNT_NOUNS[EVENT_COUNT_FORMAT.select(value.count)]}`,
        ...(parents.length === 0 ? [] : [`also ${parents.join(", ")}`]),
      ].join(" · "),
    );
  }

  return descriptions;
}

/**
 * Drops a repeated tag and the rows beneath it when a menu lists each tag once.
 */
export function dropListedRows(
  rows: readonly TagItemRow[],
  leaves: boolean,
): TagItemRow[] {
  const kept: TagItemRow[] = [];
  const listed = new Set<string>();
  let skipBelow: number | undefined;

  for (const row of rows) {
    if (skipBelow !== undefined && row.depth > skipBelow) {
      continue;
    }

    skipBelow = !leaves && listed.has(row.id) ? row.depth : undefined;

    if (skipBelow === undefined) {
      listed.add(row.id);
      kept.push(row);
    }
  }

  return kept;
}

/**
 * Whether a row can be ticked: any but a folder, which only opens its tags.
 */
export function isOfferedRow(node: Readonly<CascaderNode>): boolean {
  return TAG_FOLDER.safeParse(node.data).data?.folder !== true;
}

/**
 * Nests rows depth first under each parent.
 */
export function nestTagItems(rows: readonly TagItemRow[]): CascaderNode[] {
  const roots: CascaderNode[] = [];
  // The last row seen at each depth, which the next one deeper joins.
  const parents: CascaderNode[] = [];

  for (const row of rows) {
    const parent = parents[row.depth - 1];

    if (parent === undefined) {
      roots.push(row.node);
    } else {
      parent.children = [...(parent.children ?? []), row.node];
    }

    parents[row.depth] = row.node;
    parents.length = row.depth + 1;
  }

  return roots;
}

/**
 * The tags a menu may list: every one, or only those with tags beneath them.
 */
export function pickCandidates(
  values: readonly EventFacetValue[],
  leaves: boolean,
): EventFacetValue[] {
  const candidates: EventFacetValue[] = [];

  for (const [index, value] of values.entries()) {
    if (leaves || (values[index + 1]?.depth ?? 0) > value.depth) {
      candidates.push(value);
    }
  }

  return candidates;
}

/**
 * One tag root's row: its tags beneath it, left out when the menu offers neither it nor a tag in it.
 */
export function toFieldItem(
  field: EventGroupField,
  children: readonly CascaderNode[],
  flag: TagMenuFlag,
): CascaderNode | undefined {
  const offered = field.menus[flag];

  if (
    field.id.startsWith(TAG_FIELD_PREFIX) &&
    !offered &&
    children.length === 0
  ) {
    return undefined;
  }

  return {
    ...(children.length === 0 ? {} : { children: [...children] }),
    ...(offered ? {} : { data: { folder: true } }),
    description: field.description,
    ...(field.icon === undefined ? {} : { icon: field.icon }),
    keywords: [field.label],
    label: field.label,
    value: field.id,
  };
}

/**
 * The list's values for ticked ids: every row of a tag under several parents.
 */
export function toRowValues(
  ids: readonly string[],
  fields: readonly Readonly<{ values: readonly EventFacetValue[] }>[],
): string[] {
  const values: string[] = [];
  const shared = new Set<string>();

  for (const field of fields) {
    for (const value of field.values) {
      if (ids.includes(value.id) && (value.alsoUnder ?? []).length > 0) {
        shared.add(value.id);
        values.push(`${value.id}${SHARED_SEPARATOR}${value.path}`);
      }
    }
  }

  for (const id of ids) {
    if (!shared.has(id)) {
      values.push(id);
    }
  }

  return values;
}

/**
 * The tag ids a click leaves ticked, a tag under several parents being one tag.
 */
export function toTaggedIds(
  next: readonly string[],
  previous: readonly string[],
): string[] {
  const before = new Set<string>();
  const changed = new Set<string>();
  const ticked = new Set<string>();

  for (const value of previous) {
    before.add(toTagId(value));

    if (!next.includes(value)) {
      changed.add(toTagId(value));
    }
  }

  for (const value of next) {
    if (!before.has(toTagId(value)) || !changed.has(toTagId(value))) {
      ticked.add(toTagId(value));
    }
  }

  return [...ticked];
}

/**
 * Each offered tag as a row at its depth, a shared tag's value holding its path.
 */
export function toTagItemRows(
  offered: readonly OfferedValue[],
  descriptions: readonly string[],
  shared: boolean,
): TagItemRow[] {
  const rows: TagItemRow[] = [];

  for (const [index, { folder, value }] of offered.entries()) {
    const isShared = shared && (value.alsoUnder ?? []).length > 0;

    rows.push({
      depth: value.depth,
      id: value.id,
      node: {
        ...(folder ? { data: { folder: true } } : {}),
        description: descriptions[index] ?? "",
        icon: createElement(TagLead, {
          icon: value.icon ?? undefined,
          id: value.id,
          label: value.name,
        }),
        keywords: [value.name, value.path],
        label: value.name,
        value: isShared
          ? `${value.id}${SHARED_SEPARATOR}${value.path}`
          : value.id,
      },
    });
  }

  return rows;
}

/**
 * The tag id a row's value holds.
 */
function toTagId(value: string): string {
  return value.split(SHARED_SEPARATOR)[0] ?? value;
}
