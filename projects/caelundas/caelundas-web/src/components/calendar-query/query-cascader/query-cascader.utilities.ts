import type { BranchState } from "./query-cascader.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The branches shown ticked though their own value is not picked: those with every row beneath them that can be offered ticked.
 */
export function findFullBranches(
  items: readonly CascaderNode[],
  value: readonly string[],
  isOffered: (node: CascaderNode) => boolean,
): Set<string> {
  const ticked = new Set(value);
  const full = new Set<string>();
  const states = new Map<string, BranchState>();

  for (const node of listPostOrder(items)) {
    const covered = coverOf(node, states);
    const own = ticked.has(node.value);
    const offered = isOffered(node);

    if (offered && !own && covered === "covered") {
      full.add(node.value);
    }

    states.set(node.value, toState({ covered, offered, own }));
  }

  return full;
}

/**
 * The values after a change, with the earlier ones the list does not offer kept.
 */
export function keepHiddenValues(
  next: readonly string[],
  previous: readonly string[],
  items: readonly CascaderNode[],
): string[] {
  const offered = new Set<string>();
  const pending = [...items];

  for (let item = pending.pop(); item !== undefined; item = pending.pop()) {
    offered.add(item.value);
    pending.push(...(item.children ?? []));
  }

  return [...next, ...previous.filter((value) => !offered.has(value))];
}

/**
 * Which rows can be picked: the ones named, else every row when a pick cascades beneath it, else only leaves.
 */
export function resolveSelectable(
  cascade: boolean,
  selectable: ((node: CascaderNode) => boolean) | undefined,
): "any" | "leaf" | ((node: CascaderNode) => boolean) {
  if (selectable !== undefined) {
    return selectable;
  }

  return cascade ? "any" : "leaf";
}

/**
 * The values to keep after a change: full branches go back out, and a cleared one takes its rows.
 */
export function settleFullBranches(
  next: readonly string[],
  full: ReadonlySet<string>,
  context: Readonly<{
    isOffered: (node: CascaderNode) => boolean;
    items: readonly CascaderNode[];
  }>,
): string[] {
  const kept = new Set(next);
  const cleared = new Set<string>();

  for (const node of listPostOrder(context.items)) {
    // A full branch that is gone while every row it holds stays was itself cleared.
    const below = listPostOrder(node.children ?? []);
    const wasCleared =
      full.has(node.value) &&
      !kept.has(node.value) &&
      below.every((row) => !context.isOffered(row) || kept.has(row.value));

    for (const row of wasCleared ? below : []) {
      cleared.add(row.value);
    }
  }

  return next.filter((value) => !full.has(value) && !cleared.has(value));
}

/**
 * The cascader's expansion props, leaving out the ones not given.
 */
export function toExpansion(
  defaultExpanded: readonly string[] | undefined,
  expanded: readonly string[] | undefined,
  onExpandedChange: ((expanded: string[]) => void) | undefined,
): {
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
} {
  return {
    ...(defaultExpanded === undefined
      ? {}
      : { defaultExpanded: [...defaultExpanded] }),
    ...(expanded === undefined ? {} : { expanded: [...expanded] }),
    ...(onExpandedChange === undefined ? {} : { onExpandedChange }),
  };
}

/**
 * Whether the rows directly beneath a node that can be ticked are all ticked, some are not, or none can be.
 */
function coverOf(
  node: CascaderNode,
  states: ReadonlyMap<string, BranchState>,
): "covered" | "empty" | "uncovered" {
  let applicable = 0;
  let satisfied = 0;

  for (const child of node.children ?? []) {
    const state = states.get(child.value) ?? "none";

    applicable += state === "none" ? 0 : 1;
    satisfied += state === "full" ? 1 : 0;
  }

  if (applicable === 0) {
    return "empty";
  }

  return applicable === satisfied ? "covered" : "uncovered";
}

/**
 * Every node of the trees, each after the nodes beneath it.
 */
function listPostOrder(items: readonly CascaderNode[]): CascaderNode[] {
  const ordered: CascaderNode[] = [];
  const stack = items.map((node) => ({ node, visited: false })).toReversed();

  for (let entry = stack.pop(); entry !== undefined; entry = stack.pop()) {
    const children = entry.node.children ?? [];

    if (entry.visited || children.length === 0) {
      ordered.push(entry.node);
    } else {
      stack.push({ node: entry.node, visited: true });

      for (const child of children.toReversed()) {
        stack.push({ node: child, visited: false });
      }
    }
  }

  return ordered;
}

/**
 * A node's state from what lies beneath it: ticked itself, or covered by its rows.
 */
function toState(facts: {
  covered: "covered" | "empty" | "uncovered";
  offered: boolean;
  own: boolean;
}): BranchState {
  if (facts.offered) {
    return facts.own || facts.covered === "covered" ? "full" : "open";
  }

  if (facts.covered === "empty") {
    return "none";
  }

  return facts.covered === "covered" ? "full" : "open";
}
