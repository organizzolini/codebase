import { describe, expect, it } from "vitest";

import { pruneEmptyGroups } from "./event-group-prune.utilities";

interface Group {
  children?: readonly Group[];
  count: number;
  id: string;
}

/** A group with its count and subgroups. */
function group(id: string, count: number, children?: Group[]): Group {
  return children === undefined ? { count, id } : { children, count, id };
}

/** Whether a group counts events of its own. */
function hasEvents(one: Group): boolean {
  return one.count > 0;
}

/** The ids of a forest, parents first. */
function listIds(groups: readonly Group[]): string[] {
  return groups.flatMap((one) => [one.id, ...listIds(one.children ?? [])]);
}

describe(pruneEmptyGroups, () => {
  it("drops a group with no events and no subgroups", () => {
    const groups = [group("a", 2), group("b", 0), group("c", 1)];

    expect(listIds(pruneEmptyGroups(groups, hasEvents))).toStrictEqual([
      "a",
      "c",
    ]);
  });

  it("keeps the order of what stays", () => {
    const groups = [group("z", 1), group("m", 0), group("a", 3)];

    expect(listIds(pruneEmptyGroups(groups, hasEvents))).toStrictEqual([
      "z",
      "a",
    ]);
  });

  it("drops a parent whose subgroups are all empty and which has no events", () => {
    const groups = [
      group("parent", 0, [
        group("one", 0),
        group("two", 0, [group("deep", 0)]),
      ]),
      group("kept", 1),
    ];

    expect(listIds(pruneEmptyGroups(groups, hasEvents))).toStrictEqual([
      "kept",
    ]);
  });

  it("keeps a parent for the subgroup that has events, and drops its empty siblings", () => {
    const groups = [group("parent", 0, [group("empty", 0), group("full", 4)])];

    expect(listIds(pruneEmptyGroups(groups, hasEvents))).toStrictEqual([
      "parent",
      "full",
    ]);
  });

  it("keeps a parent that has events of its own, whatever its subgroups hold", () => {
    const groups = [group("parent", 3, [group("empty", 0)])];
    const [kept] = pruneEmptyGroups(groups, hasEvents);

    expect(kept?.id).toBe("parent");
    expect(kept?.children).toStrictEqual([]);
  });

  it("returns the same groups, not copies, when nothing is empty", () => {
    const child = group("child", 1);
    const parent = group("parent", 1, [child]);
    const [kept] = pruneEmptyGroups([parent], hasEvents);

    expect(kept).toBe(parent);
    expect(kept?.children?.[0]).toBe(child);
  });

  it("leaves the groups it was handed as they were", () => {
    const parent = group("parent", 1, [group("empty", 0), group("full", 1)]);

    pruneEmptyGroups([parent], hasEvents);

    expect(parent.children).toHaveLength(2);
  });

  it("answers an empty forest with an empty forest", () => {
    expect(pruneEmptyGroups([], hasEvents)).toStrictEqual([]);
  });
});
