import type { FilterOption } from "@codebase/presentation";

// 🔖 Type

/**
 * What a tag option carries beyond its label: how deep the tag sits beneath
 * its root, and its own name, which its row shows in place of the path the
 * chip is labeled with.
 */
export interface TagOptionData {
  depth: number;
  name: string;
}

/**
 * One row of the tag picker: a tag, where it sits, and whether it is open.
 */
export interface TagTreeRow {
  depth: number;
  /**
   * Whether the tag has tags beneath it to open.
   */
  hasChildren: boolean;
  isExpanded: boolean;
  item: FilterOption;
  name: string;
  /**
   * How many of the picked tags lie beneath this one, so a closed tag still
   * says there are picks inside it.
   */
  selectedBelow: number;
}

// 🧩 Functions

/**
 * Finds every tag above any of the given tags, so a list opens already
 * showing the tags a rule holds.
 */
export function findAncestors(
  items: readonly FilterOption[],
  ids: readonly unknown[],
): Set<string> {
  const ancestors = new Set<string>();

  // Walking the depth-first list with the path so far, rather than looking
  // each tag's parent up, reads it once.
  const path: { depth: number; id: string }[] = [];

  for (const item of items) {
    const depth = readDepth(item);

    while (path.length > 0 && (path.at(-1)?.depth ?? 0) >= depth) {
      path.pop();
    }

    if (ids.includes(item.value)) {
      for (const above of path) {
        ancestors.add(above.id);
      }
    }

    path.push({ depth, id: item.value });
  }

  return ancestors;
}

/**
 * Lays the tags out as the picker draws them, in the order they are given,
 * depth first: a tag beneath one that is closed is left out. With
 * `showAll`, as while searching, every tag shows and none has a handle.
 */
export function toTagTreeRows(
  items: readonly FilterOption[],
  options: Readonly<{
    expanded: ReadonlySet<string>;
    selected: readonly unknown[];
    showAll: boolean;
  }>,
): TagTreeRow[] {
  const { expanded, selected, showAll } = options;
  const rows: TagTreeRow[] = [];
  let closedAt: number | undefined;

  for (const [index, item] of items.entries()) {
    const depth = readDepth(item);

    if (closedAt !== undefined && depth > closedAt) {
      continue;
    }

    closedAt = undefined;

    const hasChildren = !showAll && depth < readDepth(items[index + 1] ?? item);
    const isExpanded = hasChildren && expanded.has(item.value);

    if (hasChildren && !isExpanded) {
      closedAt = depth;
    }

    rows.push({
      depth,
      hasChildren,
      isExpanded,
      item,
      name: readName(item),
      selectedBelow: hasChildren
        ? countSelectedBelow(items, { depth, index }, selected)
        : 0,
    });
  }

  return rows;
}

/**
 * Counts the picked tags beneath the tag at an index.
 */
function countSelectedBelow(
  items: readonly FilterOption[],
  position: Readonly<{ depth: number; index: number }>,
  selected: readonly unknown[],
): number {
  const { depth, index } = position;
  let count = 0;

  for (const item of items.slice(index + 1)) {
    if (readDepth(item) <= depth) {
      break;
    }

    if (selected.includes(item.value)) {
      count += 1;
    }
  }

  return count;
}

/**
 * Reads what a tag option carries beyond its label, or nothing for an option
 * of another kind.
 */
function readData(item: FilterOption): TagOptionData | undefined {
  const { data } = item;

  if (
    typeof data === "object" &&
    data !== null &&
    "depth" in data &&
    "name" in data &&
    typeof data.depth === "number" &&
    typeof data.name === "string"
  ) {
    return { depth: data.depth, name: data.name };
  }

  return undefined;
}

/**
 * Reads how deep a tag option sits, 0 for one with no depth.
 */
function readDepth(item: FilterOption): number {
  return readData(item)?.depth ?? 0;
}

/**
 * Reads the name a tag's row shows: its own, or its label for an option that
 * carries none.
 */
function readName(item: FilterOption): string {
  return readData(item)?.name ?? item.label;
}
