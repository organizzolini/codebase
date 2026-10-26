import type { TagPath } from "./tags.types";

/**
 * The tree nodes a detector's raw tag string stands for, each as the path
 * from its root down to it. Every raw tag falls back to a root of its own,
 * named for itself, so a new detector tag never breaks ingestion.
 */
export function resolveTagPaths(rawTag: string): TagPath[] {
  return [[rawTag]];
}

/**
 * The key a node is found by among the nodes already stored: its parent and
 * its own name, which together are unique, because a name is unique among
 * its siblings.
 */
export function tagNodeKey(parentId: null | string, name: string): string {
  return `${parentId ?? ""}\u0000${name}`;
}
