import {
  DATE_RANGE_EDITOR,
  DERIVED_FIELD_IDS,
  DERIVED_OPERATORS,
  DURATION_BUCKETS,
  TAG_FIELD_PREFIX,
  TAG_OPERATORS,
  TEMPORALITIES,
  WEEKDAY_LABELS,
} from "./event-filters.constants";

import type { EventFacet } from "../events-database/events-database.types";
import type { EventFilterField } from "./event-filters.types";
import type { FilterOperator, FilterOption } from "@codebase/presentation";

const EVENT_COUNT_FORMAT = new Intl.PluralRules("en-US");

/**
 * The operators every tag field offers, in the order the builder lists them.
 */
const TAG_FIELD_OPERATORS: FilterOperator[] = [
  {
    arity: "many",
    inverse: TAG_OPERATORS.isNoneOf,
    label: "is any of",
    value: TAG_OPERATORS.isAnyOf,
  },
  { arity: "many", label: "has all of", value: TAG_OPERATORS.hasAllOf },
  {
    arity: "many",
    inverse: TAG_OPERATORS.isAnyOf,
    label: "is none of",
    value: TAG_OPERATORS.isNoneOf,
  },
];

const SET_OPERATORS: FilterOperator[] = [
  {
    arity: "many",
    inverse: DERIVED_OPERATORS.isNoneOf,
    label: "is any of",
    value: DERIVED_OPERATORS.isAnyOf,
  },
  {
    arity: "many",
    inverse: DERIVED_OPERATORS.isAnyOf,
    label: "is none of",
    value: DERIVED_OPERATORS.isNoneOf,
  },
];

const RANGE_OPERATORS: FilterOperator[] = [
  {
    arity: "range",
    inverse: DERIVED_OPERATORS.notBetween,
    label: "is between",
    value: DERIVED_OPERATORS.between,
  },
  {
    arity: "range",
    inverse: DERIVED_OPERATORS.between,
    label: "is not between",
    value: DERIVED_OPERATORS.notBetween,
  },
];

/**
 * The fields read from each event's own columns rather than its tags. Times
 * are the observer's local ones.
 */
const DERIVED_FIELDS: readonly EventFilterField[] = [
  {
    defaultOperator: DERIVED_OPERATORS.between,
    description: "The days an event overlaps",
    editor: DATE_RANGE_EDITOR,
    id: DERIVED_FIELD_IDS.date,
    label: "Date",
    operators: RANGE_OPERATORS,
  },
  {
    defaultOperator: DERIVED_OPERATORS.isAnyOf,
    id: DERIVED_FIELD_IDS.weekday,
    label: "Weekday",
    operators: SET_OPERATORS,
    options: WEEKDAY_LABELS.map((label, index) => ({
      label,
      value: String(index),
    })),
    type: "multiselect",
  },
  {
    defaultOperator: DERIVED_OPERATORS.between,
    description: "The hour an event starts, from 0 to 23",
    id: DERIVED_FIELD_IDS.hour,
    label: "Hour",
    operators: RANGE_OPERATORS,
    type: "range",
  },
  {
    defaultOperator: DERIVED_OPERATORS.isAnyOf,
    id: DERIVED_FIELD_IDS.duration,
    label: "Duration",
    operators: SET_OPERATORS,
    options: DURATION_BUCKETS.map((bucket) => ({
      label: bucket.label,
      value: bucket.value,
    })),
    type: "multiselect",
  },
  {
    defaultOperator: DERIVED_OPERATORS.isAnyOf,
    id: DERIVED_FIELD_IDS.temporality,
    label: "Temporality",
    operators: SET_OPERATORS,
    options: TEMPORALITIES.map((temporality) => ({
      label: temporality,
      value: temporality,
    })),
    type: "multiselect",
  },
  {
    defaultOperator: DERIVED_OPERATORS.contains,
    description: "The summary and description",
    id: DERIVED_FIELD_IDS.text,
    label: "Text",
    operators: [
      {
        inverse: DERIVED_OPERATORS.notContains,
        label: "contains",
        value: DERIVED_OPERATORS.contains,
      },
      {
        inverse: DERIVED_OPERATORS.contains,
        label: "does not contain",
        value: DERIVED_OPERATORS.notContains,
      },
    ],
    placeholder: "Search events...",
    type: "text",
  },
];

const DERIVED_LABELS = new Set(
  DERIVED_FIELDS.map((field) => field.label.toLowerCase()),
);

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
 * Names how many events a tag matches.
 */
function formatEventCount(count: number): string {
  const noun = EVENT_COUNT_FORMAT.select(count) === "one" ? "event" : "events";

  return `${String(count)} ${noun}`;
}

/**
 * Builds the field for one tag root. Each option is labeled with its path
 * beneath the root, so a nested tag reads in context.
 */
function toTagField(facet: EventFacet): EventFilterField {
  const options: FilterOption[] = [];

  for (const value of facet.values) {
    options.push({
      description: formatEventCount(value.count),
      keywords: [value.name],
      label: value.path,
      value: value.id,
    });
  }

  return {
    defaultOperator: TAG_OPERATORS.isAnyOf,
    id: `${TAG_FIELD_PREFIX}${facet.id}`,
    label: facet.name,
    operators: TAG_FIELD_OPERATORS,
    options,
    type: "multiselect",
  };
}
