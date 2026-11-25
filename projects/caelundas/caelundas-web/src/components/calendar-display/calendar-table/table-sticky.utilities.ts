import {
  FULL_CLIP,
  NO_ROW,
  STICKY_TOLERANCE,
} from "./calendar-table.constants";

import type { StickyPlan, StickyRow } from "./calendar-table.types";

// 🔏 Private Functions

/**
 * Applies the plan to a scroller's rows: each clipped, pushed, and its divider hidden.
 */
export function clipUnderStickyStack(container: HTMLElement | null): void {
  const elements = [
    ...(container?.querySelectorAll<HTMLElement>("tbody > tr") ?? []),
  ];
  const containerTop = container?.getBoundingClientRect().top ?? 0;
  const rows = elements.map((element): StickyRow => {
    const { bottom, top } = element.getBoundingClientRect();
    const depth =
      element.dataset["depth"] === undefined
        ? undefined
        : Number(element.dataset["depth"]);
    const reach = containerTop + (depth ?? 0) * (bottom - top);

    return {
      bottom,
      depth,
      stuck: depth !== undefined && top <= reach + STICKY_TOLERANCE,
      top,
    };
  });
  const plans = planStickyRows(rows, containerTop);

  for (const [index, element] of elements.entries()) {
    const { clip, line, shift } = plans[index] ?? {
      clip: "",
      line: "",
      shift: "",
    };

    element.style.clipPath = clip;
    element.style.borderBottomColor = line;
    element.style.transform = shift;
  }
}

/**
 * How each row shows under the sticky stack: pushed out, cut away, or whole, covered dividers hidden.
 */
export function planStickyRows(
  rows: readonly StickyRow[],
  containerTop: number,
): StickyPlan[] {
  const boundaries = getBoundaries(rows);
  const pushes = rows.map((row, index) =>
    getPush(row, boundaries[index] ?? Infinity, containerTop),
  );
  const bottoms = rows.map((row, index) =>
    getVisibleBottom(row, pushes[index], containerTop),
  );
  const stackBottom = Math.max(containerTop, ...bottoms);

  return rows.map((row, index) => {
    const pushed = pushes[index];

    return pushed === undefined
      ? getRowPlan(row, stackBottom)
      : getStuckPlan(pushed, (bottoms[index] ?? 0) >= stackBottom);
  });
}

/**
 * Where each group's section ends: the top of the next group no deeper than it, or none.
 */
function getBoundaries(rows: readonly StickyRow[]): number[] {
  const later = [NO_ROW];
  const boundaries = rows.map(() => Infinity);

  for (const [index, row] of [...rows.entries()].toReversed()) {
    if (row.depth === undefined) {
      continue;
    }

    while ((later.at(-1) ?? NO_ROW).depth > row.depth) {
      later.pop();
    }

    boundaries[index] = (later.at(-1) ?? NO_ROW).top;
    later.push({ depth: row.depth, top: row.top });
  }

  return boundaries;
}

/**
 * How far the next section has pushed a stuck group up, as a share of its height; none when it is not stuck.
 */
function getPush(
  row: StickyRow,
  boundary: number,
  containerTop: number,
): number | undefined {
  const height = row.bottom - row.top;
  const slotBottom = containerTop + ((row.depth ?? 0) + 1) * height;

  return row.stuck
    ? (slotBottom - Math.min(slotBottom, boundary)) / height
    : undefined;
}

/**
 * How a row that is not stuck shows: whole, partly cut by the stack, or gone.
 */
function getRowPlan(row: StickyRow, stackBottom: number): StickyPlan {
  const covered = (stackBottom - row.top) / (row.bottom - row.top);

  if (covered >= 1) {
    return { clip: FULL_CLIP, line: "transparent", shift: "" };
  }

  return {
    clip: covered > 0 ? `inset(${String(covered * 100)}% 0 0 0)` : "",
    line: "",
    shift: "",
  };
}

/**
 * How a stuck group shows: whole, pushed up and cut as the next section nears, or gone.
 */
function getStuckPlan(pushed: number, lowest: boolean): StickyPlan {
  if (pushed >= 1) {
    return { clip: FULL_CLIP, line: "transparent", shift: "" };
  }

  return {
    clip: pushed > 0 ? `inset(${String(pushed * 100)}% 0 0 0)` : "",
    line: pushed > 0 || !lowest ? "transparent" : "",
    shift: pushed > 0 ? `translateY(-${String(pushed * 100)}%)` : "",
  };
}

/**
 * Where a stuck group's visible part ends, or the scroller's top when it is gone.
 */
function getVisibleBottom(
  row: StickyRow,
  pushed: number | undefined,
  containerTop: number,
): number {
  const height = row.bottom - row.top;

  return pushed === undefined || pushed >= 1
    ? containerTop
    : containerTop + ((row.depth ?? 0) + 1 - pushed) * height;
}
