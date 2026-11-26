import { DEFAULT_COLUMN_IDS } from "../../calendar-display/calendar-table/calendar-table.constants";
import { DERIVED_FIELD_IDS } from "../calendar-filters/components/event-filter-model/event-filters.constants";
import { SORT_OPTIONS } from "../calendar-sort-strip/calendar-sort-strip.constants";

import type { EventFilterField } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGroupField } from "../calendar-group-strip/components/event-group-model/event-groups.types";

// 🔏 Private Functions

/**
 * The ids of the columns the table shows: the link's, else the defaults.
 */
export function getSelectedColumnIds(
  columns: readonly string[] | undefined,
): readonly string[] {
  return columns === undefined || columns.length === 0
    ? DEFAULT_COLUMN_IDS
    : columns;
}

// 🌎 Public Functions

/**
 * Whether a tag root or a tag of it is among the selected columns.
 */
export function isTagSelected(
  rootId: string,
  tagIds: readonly string[],
  selected: readonly string[],
): boolean {
  return (
    selected.includes(rootId) || tagIds.some((id) => selected.includes(id))
  );
}

/**
 * The filter fields that fit a selected column: tag roots and the derived fields of Name, Start and End.
 */
export function restrictFilterFields(
  fields: readonly EventFilterField[],
  selected: readonly string[],
): EventFilterField[] {
  const kept: EventFilterField[] = [];

  for (const field of fields) {
    const options =
      "options" in field && Array.isArray(field.options)
        ? (field.options as readonly { value: string }[])
        : [];
    const keep = field.id.startsWith("tag:")
      ? isTagSelected(
          field.id,
          options.map((option) => option.value),
          selected,
        )
      : isDerivedFieldSelected(field.id, selected);

    if (keep) {
      kept.push(field);
    }
  }

  return kept;
}

/**
 * The tag roots a sort may rank by: those selected, or only their selected tags.
 */
export function restrictGroupFields(
  fields: readonly EventGroupField[],
  selected: readonly string[],
): EventGroupField[] {
  const kept: EventGroupField[] = [];

  for (const field of fields) {
    if (selected.includes(field.id)) {
      kept.push(field);
      continue;
    }

    const nodes = field.nodes.filter((node) => selected.includes(node.id));

    if (nodes.length > 0) {
      kept.push({ ...field, nodes });
    }
  }

  return kept;
}

/**
 * The sort keys for the selected columns: Tags and Event count, Name with Name, First event with Start or End.
 */
export function restrictSortKeys(
  selected: readonly string[],
): readonly string[] {
  const offered: Readonly<Record<string, boolean>> = {
    count: true,
    first: selected.includes("start") || selected.includes("end"),
    name: selected.includes("name"),
    order: true,
  };
  const keys: string[] = [];

  for (const option of SORT_OPTIONS) {
    if (offered[option.key] === true) {
      keys.push(option.key);
    }
  }

  return keys;
}

/**
 * Whether a derived filter field fits a selected column: Name for text, Start and End for duration.
 */
function isDerivedFieldSelected(
  id: string,
  selected: readonly string[],
): boolean {
  const start = selected.includes("start");
  const end = selected.includes("end");

  if (id === DERIVED_FIELD_IDS.text) {
    return selected.includes("name");
  }

  if (
    id === DERIVED_FIELD_IDS.duration ||
    id === DERIVED_FIELD_IDS.durationMinutes
  ) {
    return start && end;
  }

  return start || end;
}
