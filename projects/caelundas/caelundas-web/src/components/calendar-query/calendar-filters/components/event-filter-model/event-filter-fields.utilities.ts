import { Link2 } from "lucide-react";
import { createElement } from "react";

import { TagLead } from "../../../../calendar-events/tag-lead/tag-lead";
import { TAG_NOTE } from "../../../filter-tag-editor/filter-tag-editor.constants";
import { describeAlsoUnder } from "../../../filter-tag-editor/filter-tag-editor.utilities";

import {
  DERIVED_FIELDS,
  DERIVED_LABELS,
  EVENT_COUNT_FORMAT,
  EVENT_COUNT_NOUNS,
  NUMBER_FIELD_OPERATORS,
  NUMERIC_TAG_NAME,
  TAG_FIELD_OPERATORS,
} from "./event-filter-fields.constants";
import {
  NUMBER_OPERATORS,
  TAG_FIELD_PREFIX,
  TAG_OPERATORS,
  TAG_OPTIONS_EDITOR,
  TAG_ROOT_DESCRIPTIONS,
} from "./event-filters.constants";

import type { EventFacet } from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventFilterField, EventFilterValue } from "./event-filters.types";
import type {
  FilterOption,
  FilterValueDisplayContext,
} from "@codebase/presentation";
import type { ReactNode } from "react";

/**
 * Builds the filter fields: one per tag root in the facets, then the derived fields; a root named like one of those is skipped.
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
 * The icon of a tag root, drawn beside its field's name.
 */
export function createRootIcon(facet: EventFacet): ReactNode {
  return createElement(TagLead, {
    icon: facet.icon ?? undefined,
    label: facet.name,
  });
}

/**
 * Lists a tag root's tags as options in tree order, labeled by name, or by path where two tags share a name.
 */
export function createTagOptions(facet: EventFacet): FilterOption[] {
  const options: FilterOption[] = [];
  // The tag first seen under each name: another tag with that name, not the same tag listed under a second parent, makes the name ambiguous.
  const seen = new Map<string, string>();
  const shared = new Set<string>();

  for (const value of facet.values) {
    const first = seen.get(value.name) ?? value.id;

    if (first !== value.id) {
      shared.add(value.name);
    }

    seen.set(value.name, first);
  }

  for (const value of facet.values) {
    // Written here rather than through a function, which would be one more
    // call on every stack beneath.
    options.push({
      data: {
        alsoUnder: value.alsoUnder,
        depth: value.depth - 1,
        name: value.name,
        ...(typeof value.note === "string" ? { note: value.note } : {}),
      },
      description: `${String(value.count)} ${EVENT_COUNT_NOUNS[EVENT_COUNT_FORMAT.select(value.count)]}`,
      icon: createElement(TagLead, {
        icon: value.icon ?? undefined,
        id: value.id,
        label: value.name,
      }),
      keywords: [value.name, value.path],
      label: shared.has(value.name) ? value.path : value.name,
      value: value.id,
    });
  }

  return options;
}

/**
 * What a tag root means: its own description, or one derived from its name for a root added to the data.
 */
export function describeRoot(facet: EventFacet): string {
  return (
    facet.note ??
    TAG_ROOT_DESCRIPTIONS[facet.name] ??
    `The ${facet.name.toLowerCase()} of the event`
  );
}

/**
 * What a tag option says beneath its name: its note, then its count of events.
 */
export function describeTagOption(option: FilterOption): string | undefined {
  const note = TAG_NOTE.safeParse(option.data).data?.note;

  if (note === undefined) {
    return option.description;
  }

  return option.description === undefined
    ? note
    : `${note} · ${option.description}`;
}

/**
 * Whether every tag beneath a root ends in a number, such as "Harmonic 6", so the root reads as a number to compare.
 */
function isNumericFacet(facet: EventFacet): boolean {
  return facet.values.every((value) => NUMERIC_TAG_NAME.test(value.name));
}

/**
 * What a tag rule's chip shows: one tag with its icon, and a link mark if it has several parents, else a count.
 */
function renderTagValue(
  context: FilterValueDisplayContext<EventFilterValue>,
): ReactNode {
  const { labels, options, values } = context;
  const [option] = options;

  if (values.length === 0) {
    return labels.selectPlaceholder;
  }

  if (values.length > 1) {
    return labels.valueCount(values.length);
  }

  const alsoUnder =
    option === undefined ? undefined : describeAlsoUnder(option);

  return createElement(
    "span",
    { className: "flex items-center gap-1.5" },
    option?.icon,
    option?.label ?? String(values[0]),
    alsoUnder === undefined
      ? null
      : createElement(
          "span",
          {
            "aria-label": alsoUnder.title,
            className: "text-muted-foreground flex shrink-0 items-center",
            "data-testid": "chip-also-under",
            role: "img",
            title: alsoUnder.title,
          },
          createElement(Link2, { "aria-hidden": true, className: "size-3" }),
        ),
  );
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
      icon: createRootIcon(facet),
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
    icon: createRootIcon(facet),
    id: `${TAG_FIELD_PREFIX}${facet.id}`,
    label: facet.name,
    operators: TAG_FIELD_OPERATORS,
    options,
    renderValue: renderTagValue,
    type: "multiselect",
  };
}
