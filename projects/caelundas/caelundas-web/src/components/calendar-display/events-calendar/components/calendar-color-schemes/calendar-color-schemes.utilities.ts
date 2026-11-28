import {
  TAG_FIELD_PREFIX,
  WEEKDAY_LABELS,
} from "../../../../calendar-query/calendar-filters/components/event-filter-model/event-filters.constants";
import { ALL_TAGS_FIELD } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.constants";
import { formatDerivedKey } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-labels.utilities";
import { readDepth } from "../../../../calendar-query/filter-tag-editor/event-filter-tag-tree.utilities";
import { EVENT_COLOR_RULES } from "../calendar-colors/calendar-colors.constants";
import { getEventColor } from "../calendar-colors/calendar-colors.utilities";

import { deriveChildColor, readOklch } from "./calendar-color-derive.utilities";
import { COLOR_PALETTE, HOURS } from "./calendar-color-schemes.constants";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type {
  ColorLegendEntry,
  ColorScheme,
  LevelPainter,
  PaintContext,
  PaintStep,
  TagNode,
} from "./calendar-color-schemes.types";
import type { FilterOption } from "@codebase/presentation";

// 🌎 Public Functions

/**
 * Colors events by grouping: first-level tags take palette colors, deeper tags derive from them.
 */
export function createColorScheme(
  grouping: readonly EventGroupLevel[],
  fields: readonly EventGroupField[],
): ColorScheme {
  const painters: LevelPainter[] = [];
  const seen = new Set<string>();
  let used = 0;

  for (const [index, level] of grouping.entries()) {
    const field = fields.find((candidate) => candidate.id === level.field);
    let painter: LevelPainter | undefined;

    // The levels over every root's tags color by the roots, in the first.
    if (level.field === ALL_TAGS_FIELD) {
      painter = paintRoots(fields, used, level);
    } else if (field !== undefined && !seen.has(field.id)) {
      seen.add(field.id);
      painter =
        field.options.length > 0
          ? paintTags(level, field, used)
          : paintValues(field, index);
    }

    if (painter !== undefined) {
      used += painter.tops;
      painters.push(painter);
    }
  }

  if (painters[0] === undefined) {
    return {
      colorOf: getEventColor,
      legend: EVENT_COLOR_RULES.map((rule) => ({
        color: rule.color,
        depth: 0,
        key: rule.path,
        label: rule.label,
      })),
    };
  }

  return {
    colorOf: (event) => {
      for (const painter of painters) {
        const color = painter.colorOf(event);

        if (color !== null) {
          return color;
        }
      }

      return getEventColor(event);
    },
    legend: painters[0].legend,
  };
}

// 🔒 Private Functions

/**
 * Arranges the tags of a root as a tree, from their depth-first order and depths.
 */
function buildTagTree(
  options: readonly FilterOption[],
  depths: readonly number[],
): TagNode[] {
  const roots: TagNode[] = [];
  const stack: TagNode[] = [];

  for (const [index, option] of options.entries()) {
    const depth = Math.min(depths[index] ?? 0, stack.length);
    const node = { children: [], depth, id: option.value, label: option.label };
    const parent = stack[depth - 1];

    if (parent === undefined) {
      roots.push(node);
    } else {
      parent.children.push(node);
    }

    stack.length = depth;
    stack.push(node);
  }

  return roots;
}

/**
 * The color of the first root an event has a tag of, from its deepest tag there.
 */
function findRootColor(
  painted: readonly PaintContext["colors"][],
  event: CalendarEventRecord,
): null | string {
  for (const colors of painted) {
    let best: undefined | { color: string; depth: number };

    for (const tag of event.tags) {
      const found = colors.get(tag.id);

      if (found !== undefined && found.depth > (best?.depth ?? -2)) {
        best = found;
      }
    }

    if (best !== undefined) {
      return best.color;
    }
  }

  return null;
}

/**
 * The color of a key from its own text, for a value with no place in a
 * legend.
 */
function hashColor(key: string): string {
  let hash = 0;

  for (const character of key) {
    hash =
      (hash * 31 + Number(character.codePointAt(0))) %
      COLOR_PALETTE.length ** 4;
  }

  return pickColor(hash);
}

/**
 * The values of a derived field known ahead, each with the next color: weekdays and hours; periods have too many to list.
 */
function listValues(field: EventGroupField): ColorLegendEntry[] {
  const keys: { key: string; label: string }[] = [];

  switch (field.id) {
    case "hour": {
      for (const hour of HOURS) {
        keys.push({ key: hour, label: formatDerivedKey("hour", hour) });
      }

      break;
    }
    case "weekday": {
      for (const [day, label] of WEEKDAY_LABELS.entries()) {
        keys.push({ key: String(day), label });
      }

      break;
    }
    // No default
  }

  const legend: ColorLegendEntry[] = [];

  for (const [position, entry] of keys.entries()) {
    legend.push({ ...entry, color: pickColor(position), depth: 0 });
  }

  return legend;
}

/**
 * Colors a tag, and the tags beneath it from its color, recording each.
 */
function paintNode(context: PaintContext, step: PaintStep): void {
  const { node, parent } = step;
  let color: string | undefined;

  if (context.tops.has(node.id)) {
    color = pickColor(context.offset + context.used);
    context.used += 1;
  } else if (parent !== undefined) {
    color = deriveChildColor(readOklch(parent), {
      depth: step.depth,
      index: step.index,
      siblingCount: step.siblings,
    });
  }

  if (color !== undefined) {
    context.colors.set(node.id, { color, depth: node.depth });
    context.legend.push({
      color,
      depth: step.depth,
      key: node.id,
      label: node.label,
    });
  }

  for (const [index, child] of node.children.entries()) {
    paintNode(context, {
      depth: color === undefined ? 0 : step.depth + 1,
      index,
      node: child,
      parent: color,
      siblings: node.children.length,
    });
  }
}

/**
 * Gives each tag root a palette color, its tags near it; an event takes its first root's. Only the roots' level paints.
 */
function paintRoots(
  fields: readonly EventGroupField[],
  offset: number,
  level: EventGroupLevel,
): LevelPainter {
  const legend: ColorLegendEntry[] = [];
  const painted: PaintContext["colors"][] = [];

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const field of fields) {
    if (level.depth === undefined && field.id.startsWith(TAG_FIELD_PREFIX)) {
      const color = pickColor(offset + painted.length);
      const rootId = field.id.slice(TAG_FIELD_PREFIX.length);
      const depths: number[] = [];

      for (const option of field.options) {
        depths.push(readDepth(option));
      }

      const tree = buildTagTree(field.options, depths);
      const context: PaintContext = {
        colors: new Map([[rootId, { color, depth: -1 }]]),
        legend,
        offset,
        tops: new Set(),
        used: 0,
      };

      legend.push({ color, depth: 0, key: rootId, label: field.label });

      for (const [index, node] of tree.entries()) {
        paintNode(context, {
          depth: 1,
          index,
          node,
          parent: color,
          siblings: tree.length,
        });
      }

      painted.push(context.colors);
    }
  }

  return {
    colorOf: (event) => findRootColor(painted, event),
    legend,
    tops: painted.length,
  };
}

/**
 * Gives each tag a level colors a palette color, and the tags beneath it near that one.
 */
function paintTags(
  level: EventGroupLevel,
  field: EventGroupField,
  offset: number,
): LevelPainter {
  const picked = level.tags ?? [];
  const tops = new Set<string>(picked);

  const depths: number[] = [];

  for (const option of field.options) {
    depths.push(readDepth(option));
  }

  if (picked.length === 0) {
    for (const [index, option] of field.options.entries()) {
      if (depths[index] === (level.depth ?? 1) - 1) {
        tops.add(option.value);
      }
    }
  }

  const context: PaintContext = {
    colors: new Map(),
    legend: [],
    offset,
    tops,
    used: 0,
  };
  const roots = buildTagTree(field.options, depths);

  for (const [index, root] of roots.entries()) {
    paintNode(context, {
      depth: 0,
      index,
      node: root,
      parent: undefined,
      siblings: roots.length,
    });
  }

  return {
    colorOf: (event) => {
      let best: undefined | { color: string; depth: number };

      for (const tag of event.tags) {
        const found = context.colors.get(tag.id);

        if (found !== undefined && found.depth > (best?.depth ?? -1)) {
          best = found;
        }
      }

      return best?.color ?? null;
    },
    legend: context.legend,
    tops: context.used,
  };
}

/**
 * Colors a derived field by value, reading the keys at the level's index.
 */
function paintValues(field: EventGroupField, index: number): LevelPainter {
  const legend = listValues(field);

  return {
    colorOf: (event) => {
      const keys = event.groups[index] ?? [];

      for (const entry of legend) {
        if (keys.some(({ key }) => key === entry.key)) {
          return entry.color;
        }
      }

      // A value with no place in a legend, such as one year of many, gets a
      // color from its own text.
      const [first] = keys;

      return legend.length === 0 && first !== undefined
        ? hashColor(first.key)
        : null;
    },
    legend,
    tops: 0,
  };
}

/**
 * The color at a position in the palette, which starts over after its last.
 */
function pickColor(position: number): string {
  return String(COLOR_PALETTE[position % COLOR_PALETTE.length]);
}
