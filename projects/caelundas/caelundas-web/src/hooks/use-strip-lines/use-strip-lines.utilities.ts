import {
  LINE_END_ATTRIBUTE,
  LINE_START_ATTRIBUTE,
  STRIP_ITEM_SELECTOR,
} from "./use-strip-lines.constants";

import type { StripLineFlags } from "./use-strip-lines.types";

// 🔏 Private Functions

/**
 * The nearest ancestor that draws a box, since the strip's own element does not.
 */
export function getBoxElement(root: HTMLElement): HTMLElement {
  let element = root;

  while (
    getComputedStyle(element).display === "contents" &&
    element.parentElement !== null
  ) {
    element = element.parentElement;
  }

  return element;
}

/**
 * Reads where each item's line begins and ends from its top edge.
 */
export function getLineFlags(tops: readonly number[]): StripLineFlags[] {
  const flags: StripLineFlags[] = [];

  for (const [index, top] of tops.entries()) {
    flags.push({
      isEnd: index === tops.length - 1 || tops[index + 1] !== top,
      isStart: index > 0 && tops[index - 1] !== top,
    });
  }

  return flags;
}

// 🌎 Public Functions

/**
 * Flags the items that open and close a line, measuring until the flags settle.
 */
export function markStripLines(root: HTMLElement): void {
  const items = getItems(root);

  setFlags(
    items,
    items.map(() => ({ isEnd: false, isStart: false })),
  );

  for (let pass = 0; pass <= items.length; pass += 1) {
    const tops = items.map((item) => Math.round(item.offsetTop));

    if (!setFlags(items, getLineFlags(tops))) {
      return;
    }
  }
}

/**
 * The strip's items in document order.
 */
function getItems(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(STRIP_ITEM_SELECTOR)];
}

// An opener sheds the join that overlaps its neighbor, which can push a later
// item down, so each pass measures again until no opener moves.

/**
 * Writes each item's flags as attributes; whether any opener changed.
 */
function setFlags(
  items: readonly HTMLElement[],
  flags: readonly StripLineFlags[],
): boolean {
  let changed = false;

  for (const [index, item] of items.entries()) {
    const isStart = flags[index]?.isStart === true;

    if (item.hasAttribute(LINE_START_ATTRIBUTE) !== isStart) {
      item.toggleAttribute(LINE_START_ATTRIBUTE, isStart);
      changed = true;
    }

    item.toggleAttribute(LINE_END_ATTRIBUTE, flags[index]?.isEnd === true);
  }

  return changed;
}
