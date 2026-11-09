import type {
  FilterCollectionFieldsFragment,
  FilterGroupFieldsFragment,
} from "../../graphql/generated/operations";
import type { ResolvedEventFilterCollection } from "./event-filter-collections.types";
import type { EventFilterNode, EventFilterQuery } from "./event-filters.types";

/**
 * Reads an API collection as the calendar's own ReUI filter tree, with each node given an id.
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
 * Reads an API filter group as a ReUI group, rules first then nested groups; `position` locates it in the collection.
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
