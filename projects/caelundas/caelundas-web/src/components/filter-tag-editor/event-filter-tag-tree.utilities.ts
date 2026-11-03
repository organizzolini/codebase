import type {
  TagCheckState,
  TagOptionData,
  TagShape,
  TagTreeRow,
} from "./event-filter-tag-tree.types";
import type { FilterOption } from "@codebase/presentation";

// 🌎 Public Functions

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
 * Each tag's state for the tags picked, where picking a tag picks everything
 * beneath it: checked when it, or all the tags beneath it, are picked, partial
 * when only some of what is beneath it is, and unchecked otherwise.
 */
export function getTagStates(
  items: readonly FilterOption[],
  selected: readonly unknown[],
): Map<string, TagCheckState> {
  const shape = measureTags(items);
  const covered = coverLeaves(items, selected, shape);
  const full = fillFromLeaves(shape, covered);
  const states = new Map<string, TagCheckState>();

  // Running counts of the leaves covered, so what lies beneath a tag is read
  // as one difference.
  const counts = [0];
  let total = 0;

  for (const flag of covered) {
    total += Number(flag);
    counts.push(total);
  }

  for (const [index, item] of items.entries()) {
    const below =
      numberAt(counts, numberAt(shape.end, index)) - numberAt(counts, index);

    states.set(
      item.value,
      full[index] ? "checked" : below > 0 ? "partial" : "unchecked",
    );
  }

  return states;
}

/**
 * Reads how deep a tag option sits, 0 for one with no depth.
 */
export function readDepth(item: FilterOption): number {
  return readData(item)?.depth ?? 0;
}

/**
 * Toggles a tag with everything beneath it: a checked or partly picked tag is
 * checked, and a checked one cleared, then the tags above it follow from
 * what is beneath them. The picks are written as the fewest tags that cover
 * them: a tag with all of its tags picked stands for them.
 */
export function toggleTag(
  items: readonly FilterOption[],
  selected: readonly unknown[],
  id: string,
): string[] {
  const index = items.findIndex((item) => item.value === id);
  const shape = measureTags(items);

  if (index === -1) {
    return selected.filter((pick) => typeof pick === "string");
  }

  const covered = coverLeaves(items, selected, shape);
  const wasFull = fillFromLeaves(shape, covered)[index] ?? false;

  for (let leaf = index; leaf < numberAt(shape.end, index); leaf += 1) {
    covered[leaf] = shape.leaf[leaf] === true && !wasFull;
  }

  return readPicks(items, shape, fillFromLeaves(shape, covered));
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
    /**
     * Each tag's state where picking a tag takes what is beneath it; every
     * tag is checked or not by whether it is picked itself without it.
     */
    states?: ReadonlyMap<string, TagCheckState>;
  }>,
): TagTreeRow[] {
  const rows: TagTreeRow[] = [];
  let closedAt: number | undefined;

  for (const [index, item] of items.entries()) {
    const depth = readDepth(item);

    if (closedAt !== undefined && depth > closedAt) {
      continue;
    }

    const row = toTagTreeRow(items, { index, item }, options);

    if (row.hasChildren) {
      row.selectedBelow = countSelectedBelow(
        items,
        { depth, index },
        options.selected,
      );
    }

    closedAt = row.hasChildren && !row.isExpanded ? depth : undefined;
    rows.push(row);
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
 * Marks the tags with none beneath them that the picks cover: those picked,
 * and those beneath a tag picked.
 */
function coverLeaves(
  items: readonly FilterOption[],
  selected: readonly unknown[],
  shape: TagShape,
): boolean[] {
  const covered: boolean[] = [];
  let coveredUntil = 0;

  for (const [index, item] of items.entries()) {
    const picked = selected.includes(item.value);

    if (picked) {
      coveredUntil = Math.max(coveredUntil, numberAt(shape.end, index));
    }

    covered.push(shape.leaf[index] === true && index < coveredUntil);
  }

  return covered;
}

/**
 * Marks every tag whose own tags are all covered, working up from the tags
 * with none beneath them.
 */
function fillFromLeaves(
  shape: TagShape,
  covered: readonly boolean[],
): boolean[] {
  const full: boolean[] = [];

  for (let index = covered.length - 1; index >= 0; index -= 1) {
    const isLeaf = shape.leaf[index] === true;
    let all = isLeaf ? covered[index] === true : true;

    for (
      let child = index + 1;
      !isLeaf && child < numberAt(shape.end, index);
      child = numberAt(shape.end, child)
    ) {
      all = all && full[child] === true;
    }

    full[index] = all;
  }

  return full;
}

/**
 * Finds where each tag's own tags end in the depth-first list, and which
 * tags have none.
 */
function measureTags(items: readonly FilterOption[]): TagShape {
  const depths: number[] = [];
  const end: number[] = [];
  const leaf: boolean[] = [];

  for (const item of items) {
    depths.push(readDepth(item));
  }

  for (let index = items.length - 1; index >= 0; index -= 1) {
    let next = index + 1;

    while (
      next < items.length &&
      numberAt(depths, next) > numberAt(depths, index)
    ) {
      next = numberAt(end, next);
    }

    end[index] = next;
    leaf[index] = next === index + 1;
  }

  return { end, leaf };
}

/**
 * Reads a number from a list the caller has filled to that index.
 */
function numberAt(list: readonly number[], index: number): number {
  return Number(list[index]);
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
 * Reads the name a tag's row shows: its own, or its label for an option that
 * carries none.
 */
function readName(item: FilterOption): string {
  return readData(item)?.name ?? item.label;
}

/**
 * The fewest tags that cover every full tag: a full tag stands for every tag
 * beneath it, which are skipped.
 */
function readPicks(
  items: readonly FilterOption[],
  shape: TagShape,
  full: readonly boolean[],
): string[] {
  const picks: string[] = [];

  for (let at = 0; at < items.length;) {
    if (full[at]) {
      picks.push(items[at]?.value ?? "");
      at = shape.end[at] ?? at + 1;
    } else {
      at += 1;
    }
  }

  return picks;
}

/**
 * One tag's row: whether it has a handle and is open, how many picks lie
 * beneath it, and whether it is checked.
 */
function toTagTreeRow(
  items: readonly FilterOption[],
  position: Readonly<{ index: number; item: FilterOption }>,
  options: Parameters<typeof toTagTreeRows>[1],
): TagTreeRow {
  const { expanded, selected, showAll, states } = options;
  const { index, item } = position;
  const depth = readDepth(item);
  const hasChildren = !showAll && depth < readDepth(items[index + 1] ?? item);
  const isExpanded = hasChildren && expanded.has(item.value);

  return {
    depth,
    hasChildren,
    isExpanded,
    item,
    name: readName(item),
    selectedBelow: 0,
    state:
      states?.get(item.value) ??
      (selected.includes(item.value) ? "checked" : "unchecked"),
  };
}
