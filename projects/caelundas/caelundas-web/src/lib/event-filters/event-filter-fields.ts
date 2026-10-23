import {
  DATE_RANGE_EDITOR,
  DERIVED_FIELD_IDS,
  DERIVED_OPERATORS,
  DURATION_BUCKETS,
  NUMBER_OPERATORS,
  TAG_FIELD_PREFIX,
  TAG_OPERATORS,
  TAG_OPTIONS_EDITOR,
  TAG_ROOT_DESCRIPTIONS,
  TEMPORALITIES,
  WEEKDAY_LABELS,
} from "./event-filters.constants";

import type { EventFacet } from "../events-database/events-database.types";
import type { EventFilterField } from "./event-filters.types";
import type { FilterOperator, FilterOption } from "@codebase/presentation";

const NUMERIC_TAG_NAME = /\d$/u;

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

/**
 * The operators a numeric field offers: equality, the orderings, and a range.
 */
const NUMBER_FIELD_OPERATORS: FilterOperator[] = [
  {
    inverse: NUMBER_OPERATORS.neq,
    label: "equals",
    value: NUMBER_OPERATORS.eq,
  },
  {
    inverse: NUMBER_OPERATORS.eq,
    label: "does not equal",
    value: NUMBER_OPERATORS.neq,
  },
  {
    inverse: NUMBER_OPERATORS.lte,
    label: "is greater than",
    value: NUMBER_OPERATORS.gt,
  },
  {
    inverse: NUMBER_OPERATORS.lt,
    label: "is at least",
    value: NUMBER_OPERATORS.gte,
  },
  {
    inverse: NUMBER_OPERATORS.gte,
    label: "is less than",
    value: NUMBER_OPERATORS.lt,
  },
  {
    inverse: NUMBER_OPERATORS.gt,
    label: "is at most",
    value: NUMBER_OPERATORS.lte,
  },
  {
    arity: "range",
    inverse: NUMBER_OPERATORS.notBetween,
    label: "is between",
    value: NUMBER_OPERATORS.between,
  },
  {
    arity: "range",
    inverse: NUMBER_OPERATORS.between,
    label: "is not between",
    value: NUMBER_OPERATORS.notBetween,
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
    description: "The day of the week an event starts, in its own time zone",
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
    defaultOperator: NUMBER_OPERATORS.eq,
    description: "The hour an event starts, from 0 to 23",
    id: DERIVED_FIELD_IDS.hour,
    label: "Hour",
    operators: NUMBER_FIELD_OPERATORS,
    type: "number",
  },
  {
    defaultOperator: DERIVED_OPERATORS.isAnyOf,
    description:
      "How long an event lasts, in steps: an instant, minutes, hours, days, weeks or months",
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
    defaultOperator: NUMBER_OPERATORS.gte,
    description: "The whole minutes from start to end, 0 for an instant",
    id: DERIVED_FIELD_IDS.durationMinutes,
    label: "Duration (minutes)",
    operators: NUMBER_FIELD_OPERATORS,
    type: "number",
  },
  {
    defaultOperator: DERIVED_OPERATORS.isAnyOf,
    description: "Whether an event is an instant or lasts for a while",
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
      description: formatEventCount(value.count),
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
 * Names how many events a tag matches.
 */
function formatEventCount(count: number): string {
  const noun = EVENT_COUNT_FORMAT.select(count) === "one" ? "event" : "events";

  return `${String(count)} ${noun}`;
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
