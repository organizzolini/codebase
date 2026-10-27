import {
  DERIVED_FIELDS,
  DERIVED_LABELS,
  EVENT_COUNT_FORMAT,
  NUMBER_FIELD_OPERATORS,
  NUMERIC_TAG_NAME,
  TAG_FIELD_OPERATORS,
} from "../constants/event-filter-fields.constants";
import {
  NUMBER_OPERATORS,
  TAG_FIELD_PREFIX,
  TAG_OPERATORS,
  TAG_OPTIONS_EDITOR,
  TAG_ROOT_DESCRIPTIONS,
} from "../constants/event-filters.constants";

import type { EventFilterField } from "../types/event-filters.types";
import type { EventFacet } from "../types/events-database.types";
import type { FilterOption } from "@codebase/presentation";

/**
 * Builds the filter builder's fields: one per tag root in the database's
 * facets, offering every tag beneath it, then the fields derived from each
 * event's time, duration, and text. A root added to the data becomes a field
 * with no change here; one named like a derived field, such as Temporality,
 * is left to the derived one, which needs no tags.
 */
export function createEventFilterFields(
  facets: readonly EventFacet[],
): EventFilterField[] {
  const fields: EventFilterField[] = [];

  // Loops rather than mapping callbacks keep the page's call stacks shallow.
  for (const facet of facets) {
    if (
      facet.values.length > 0 &&
      !DERIVED_LABELS.has(facet.name.toLowerCase())
    ) {
      fields.push(toTagField(facet));
    }
  }

  return [...fields, ...DERIVED_FIELDS];
}

/**
 * Lists a tag root's tags as options in tree order. Each is labeled by its own
 * name, as a chip reads best, unless another tag under the root has the same
 * name, when its path tells them apart; its depth is beneath the root.
 */
export function createTagOptions(facet: EventFacet): FilterOption[] {
  const options: FilterOption[] = [];
  const nameCounts = new Map<string, number>();

  for (const value of facet.values) {
    nameCounts.set(value.name, (nameCounts.get(value.name) ?? 0) + 1);
  }

  for (const value of facet.values) {
    options.push({
      data: { depth: value.depth - 1, name: value.name },
      // Written here rather than through a function, which would be one more
      // call on every stack beneath.
      description: `${String(value.count)} ${EVENT_COUNT_FORMAT.select(value.count) === "one" ? "event" : "events"}`,
      keywords: [value.name, value.path],
      label: (nameCounts.get(value.name) ?? 0) > 1 ? value.path : value.name,
      value: value.id,
    });
  }

  return options;
}

/**
 * What a tag root means, for the list of attributes: its own description, or
 * a plain one from its name for a root added to the data.
 */
export function describeRoot(facet: EventFacet): string {
  return (
    TAG_ROOT_DESCRIPTIONS[facet.name] ??
    `The ${facet.name.toLowerCase()} of the event`
  );
}

/**
 * Whether every tag beneath a root is named for a number it ends in, such as
 * "Harmonic 6", so the root reads as a number to compare rather than a set to
 * pick from.
 */
function isNumericFacet(facet: EventFacet): boolean {
  return facet.values.every((value) => NUMERIC_TAG_NAME.test(value.name));
}

/**
 * Builds the field for one tag root. Each option is labeled with its path
 * beneath the root, so a nested tag reads in context.
 */
function toTagField(facet: EventFacet): EventFilterField {
  if (isNumericFacet(facet)) {
    return {
      defaultOperator: NUMBER_OPERATORS.eq,
      description: describeRoot(facet),
      id: `${TAG_FIELD_PREFIX}${facet.id}`,
      label: facet.name,
      operators: NUMBER_FIELD_OPERATORS,
      type: "number",
    };
  }

  const options = createTagOptions(facet);

  return {
    defaultOperator: TAG_OPERATORS.isAnyOf,
    description: describeRoot(facet),
    editor: TAG_OPTIONS_EDITOR,
    id: `${TAG_FIELD_PREFIX}${facet.id}`,
    label: facet.name,
    operators: TAG_FIELD_OPERATORS,
    options,
    type: "multiselect",
  };
}
