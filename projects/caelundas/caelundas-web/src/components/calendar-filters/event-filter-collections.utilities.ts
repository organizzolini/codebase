import type {
  FilterCollectionFieldsFragment,
  FilterGroupFieldsFragment,
} from "../../graphql/generated/operations";
import type { ResolvedEventFilterCollection } from "./event-filter-collections.types";
import type { EventFilterNode, EventFilterQuery } from "./event-filters.types";

/**
 * Reads a collection the API answered as the calendar's own: the ReUI filter
 * tree the builder edits, each node given an id from the collection's.
 */
export function toEventFilterCollection(
  collection: FilterCollectionFieldsFragment,
): ResolvedEventFilterCollection {
  return {
    description: collection.description,
    filter: toGroup(collection.filter, collection.id, "0"),
    id: collection.id,
    name: collection.name,
  };
}

/**
 * Reads a group of the API's filter as a ReUI group, its rules first and its
 * nested groups after, where `position` says where it sits in the collection.
 */
function toGroup(
  group: FilterGroupFieldsFragment & {
    groups?: null | readonly FilterGroupFieldsFragment[];
  },
  collectionId: string,
  position: string,
): EventFilterQuery {
  const nodes: EventFilterNode[] = [];

  // Loops rather than mapping callbacks, which would add a frame beneath every
  // collection's call stack.
  for (const rule of group.rules ?? []) {
    nodes.push({
      id: `${collectionId}-${position}-${String(nodes.length)}`,
      ...(rule.negated === true ? { negated: true } : {}),
      operator: rule.operator,
      path: [...rule.path],
      type: "rule",
      value: rule.values ?? [],
    });
  }

  for (const child of group.groups ?? []) {
    nodes.push(
      toGroup(child, collectionId, `${position}-${String(nodes.length)}`),
    );
  }

  return {
    combinator: group.combinator === "OR" ? "or" : "and",
    id: `${collectionId}-${position}`,
    rules: nodes,
    type: "group",
  };
}
