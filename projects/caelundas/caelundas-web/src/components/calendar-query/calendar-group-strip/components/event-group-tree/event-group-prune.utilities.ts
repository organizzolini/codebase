import type { EventGroupNode } from "../event-group-model/event-groups.types";
import type { NestedGroup } from "./event-group-tree.types";

// 🌎 Public Functions

/**
 * The tree of event groups without those that hold no events, nor have a subgroup that does.
 */
export function pruneEmptyEventGroups(
  groups: readonly EventGroupNode[],
): EventGroupNode[] {
  return pruneEmptyGroups(groups, (group) => group.count > 0);
}

/**
 * Drops every group that has no events and no subgroup left; a group kept loses only its empty subgroups, in any tree shape.
 */
export function pruneEmptyGroups<Group extends NestedGroup<Group>>(
  groups: readonly Group[],
  hasEvents: (group: Group) => boolean,
): Group[] {
  const kept = new Map<Group, Group | undefined>();
  const ordered = listParentsFirst(groups);

  // Children before parents, so a parent reads what became of its subgroups.
  for (const group of ordered.toReversed()) {
    const children = group.children ?? [];
    const survivors = collectKept(children, kept);

    if (survivors.length === 0 && !hasEvents(group)) {
      kept.set(group, undefined);
    } else {
      kept.set(
        group,
        isSameList(survivors, children)
          ? group
          : { ...group, children: survivors },
      );
    }
  }

  return collectKept(groups, kept);
}

/**
 * The groups that stayed among some, in order.
 */
function collectKept<Group>(
  groups: readonly Group[],
  kept: ReadonlyMap<Group, Group | undefined>,
): Group[] {
  const survivors: Group[] = [];

  for (const group of groups) {
    const survivor = kept.get(group);

    if (survivor !== undefined) {
      survivors.push(survivor);
    }
  }

  return survivors;
}

/**
 * Whether two lists hold the same items in the same order.
 */
function isSameList<Item>(
  left: readonly Item[],
  right: readonly Item[],
): boolean {
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
 * Every group of the trees, each before the groups beneath it.
 */
function listParentsFirst<Group extends NestedGroup<Group>>(
  groups: readonly Group[],
): Group[] {
  const listed: Group[] = [];
  const pending = [...groups];

  for (let group = pending.pop(); group !== undefined; group = pending.pop()) {
    listed.push(group);
    pending.push(...(group.children ?? []));
  }

  return listed;
}
