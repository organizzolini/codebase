import { toEventFilterInput } from "../calendar-filters/components/event-filter-model/event-filter-input.utilities";
import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";
import { TAG_FIELD_PREFIX } from "../calendar-filters/components/event-filter-model/event-filters.constants";

import { CUSTOM_ID, VIEWS } from "./calendar-view-strip.constants";

import type {
  EventFacet,
  EventFacetValue,
} from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventFilterNode } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGroupLevel } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  ViewChoice,
  ViewDefinition,
  ViewLevelReference,
  ViewResolved,
  ViewSelection,
} from "./calendar-view-strip.types";

// 🔏 Private Functions

// Loops rather than find or map callbacks keep the call stacks shallow.

/** The id of the view the link's filter, group and sort match, or custom; the API input, not ids, decides whether trees filter alike. */
export function findActiveViewId(
  views: readonly ViewResolved[],
  current: Readonly<ViewSelection>,
): string {
  const key = toSelectionKey(current);

  for (const view of views) {
    if (toSelectionKey(view) === key) {
      return view.id;
    }
  }

  return CUSTOM_ID;
}

/** What a view writes to the link, or nothing for a view the data lacks. */
export function getViewSelection(
  views: readonly ViewResolved[],
  id: string | undefined,
): undefined | ViewSelection {
  for (const view of views) {
    if (view.id === id) {
      return { filter: view.filter, group: view.group, sort: view.sort };
    }
  }

  return undefined;
}

/** What can be picked: the views the data has the tags for. */
export function listViewChoices(views: readonly ViewResolved[]): ViewChoice[] {
  return views.map((view) => ({
    description: view.description,
    icon: view.icon,
    id: view.id,
    label: view.name,
  }));
}

/** The views the data can show, in menu order, leaving out any whose tags it lacks. */
export function resolveViews(facets: readonly EventFacet[]): ViewResolved[] {
  const views: ViewResolved[] = [];

  for (const definition of VIEWS) {
    const rules = resolveRules(definition, facets);

    if (definition.filter.length === 0 || rules.length > 0) {
      views.push({
        description: definition.description,
        filter:
          rules.length === 0
            ? EMPTY_EVENT_FILTER
            : {
                combinator: rules.length > 1 ? "or" : "and",
                id: `view-${definition.id}`,
                rules,
                type: "group",
              },
        group: resolveGroup(definition, facets),
        icon: definition.icon,
        id: definition.id,
        name: definition.name,
        sort: resolveSort(definition, facets),
      });
    }
  }

  return views;
}

/** The facet of the root with this name, if the data has it. */
function findRoot(
  facets: readonly EventFacet[],
  name: string,
): EventFacet | undefined {
  for (const facet of facets) {
    if (facet.name === name) {
      return facet;
    }
  }

  return undefined;
}

/** The tag of a root at a path beneath it, if the data has it. */
function findTag(
  facet: Readonly<EventFacet>,
  path: string,
): EventFacetValue | undefined {
  for (const value of facet.values) {
    if (value.path === path) {
      return value;
    }
  }

  return undefined;
}

/** The group levels a definition resolves to; none for the default grouping. */
function resolveGroup(
  definition: Readonly<ViewDefinition>,
  facets: readonly EventFacet[],
): EventGroupLevel[] | undefined {
  const group: EventGroupLevel[] = [];

  for (const reference of definition.group) {
    const picked = resolvePickedTags(reference, facets);

    if (picked !== undefined) {
      group.push(picked);
      continue;
    }

    const found = resolveReference(reference, facets);

    if (found !== undefined) {
      group.push(
        found.tag === undefined
          ? { field: found.field }
          : { field: found.field, parent: found.tag },
      );
    }
  }

  return group.length === 0 ? undefined : group;
}

// 🌎 Public Functions

/** The level of one group for each tag a reference lists by paths, when the data has any of them. */
function resolvePickedTags(
  reference: Readonly<ViewLevelReference>,
  facets: readonly EventFacet[],
): EventGroupLevel | undefined {
  const facet = findRoot(facets, reference.root);
  const tags: string[] = [];

  for (const path of reference.paths ?? []) {
    const tag = facet === undefined ? undefined : findTag(facet, path);

    if (tag !== undefined) {
      tags.push(tag.id);
    }
  }

  return facet === undefined || tags.length === 0
    ? undefined
    : { field: `${TAG_FIELD_PREFIX}${facet.id}`, tags };
}

/** What a level or sort reference names: its root's field id and the tag id of its path, when it has one. */
function resolveReference(
  reference: Readonly<ViewLevelReference>,
  facets: readonly EventFacet[],
): undefined | { field: string; tag?: string } {
  const facet = findRoot(facets, reference.root);

  if (facet === undefined) {
    return undefined;
  }

  const field = `${TAG_FIELD_PREFIX}${facet.id}`;

  if (reference.path === undefined) {
    return { field };
  }

  const tag = findTag(facet, reference.path);

  return tag === undefined ? undefined : { field, tag: tag.id };
}

/** The filter rules the definition's tags resolve to, one for each root that has some. */
function resolveRules(
  definition: Readonly<ViewDefinition>,
  facets: readonly EventFacet[],
): EventFilterNode[] {
  const rules: EventFilterNode[] = [];

  for (const reference of definition.filter) {
    const facet = findRoot(facets, reference.root);
    const ids: string[] = [];

    for (const path of reference.paths) {
      const tag = facet === undefined ? undefined : findTag(facet, path);

      if (tag !== undefined) {
        ids.push(tag.id);
      }
    }

    if (facet !== undefined && ids.length > 0) {
      rules.push({
        id: `view-${definition.id}-${String(rules.length)}`,
        operator: "is_any_of",
        path: [`${TAG_FIELD_PREFIX}${facet.id}`],
        type: "rule",
        value: ids,
      });
    }
  }

  return rules;
}

/** The tag sorts a definition resolves to; none for the default sort. */
function resolveSort(
  definition: Readonly<ViewDefinition>,
  facets: readonly EventFacet[],
): GroupSort[] | undefined {
  const sort: GroupSort[] = [];

  for (const reference of definition.sort) {
    const found = resolveReference(reference, facets);

    if (found !== undefined) {
      sort.push({
        direction: "asc",
        key: "tag",
        tag: found.tag ?? found.field,
      });
    }
  }

  return sort.length === 0 ? undefined : sort;
}

/** A selection written one way whatever the order of its keys, to compare; an absent key writes as null. */
function toSelectionKey(selection: Readonly<ViewSelection>): string {
  const group: unknown[] = [];
  const sort: unknown[] = [];

  for (const level of selection.group ?? []) {
    group.push([level.field, level.parent, level.depth, level.tags]);
  }

  for (const one of selection.sort ?? []) {
    sort.push([one.key, one.direction, one.tag, one.metric]);
  }

  return JSON.stringify([toEventFilterInput(selection.filter), group, sort]);
}
