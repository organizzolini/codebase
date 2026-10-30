import {
  DURATION_BUCKETS,
  WEEKDAY_LABELS,
} from "../calendar-filters/event-filters.constants";
import { formatDerivedKey } from "../calendar-group-by/event-group-labels.utilities";
import { readDepth } from "../filter-tag-editor/event-filter-tag-tree.utilities";

import { COLOR_PALETTE, HOURS } from "./calendar-color-schemes.constants";
import { EVENT_COLOR_RULES } from "./calendar-colors.constants";
import { getEventColor } from "./calendar-colors.utilities";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../calendar-group-by/event-groups.types";
import type {
  ColorLegendEntry,
  ColorScheme,
} from "./calendar-color-schemes.types";

// 🌎 Public Functions

/**
 * Builds how events are colored for a level: the way events are grouped, a
 * field and, for a tag root, the tags or the depth of its tree, with a color
 * for each tag or value. Without a level, events are colored by type, kind
 * by kind. An event with more than one value, such as an aspect between two
 * planets, takes the color of the first of them in the legend's order, and
 * one with none keeps the color the data gave it. `index` is where the
 * level's keys sit in an event's `groups`.
 */
export function createColorScheme(
  level: EventGroupLevel | undefined,
  fields: readonly EventGroupField[],
  index: number,
): ColorScheme {
  const field = fields.find((candidate) => candidate.id === level?.field);

  if (level === undefined || field === undefined) {
    return {
      colorOf: getEventColor,
      legend: EVENT_COLOR_RULES.map((rule) => ({
        color: rule.color,
        key: rule.path,
        label: rule.label,
      })),
    };
  }

  const legend =
    field.options.length > 0 ? listTags(field, level) : listValues(field);

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
        : event.color;
    },
    legend,
  };
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
 * The tags a tag root's level makes a color of, each with the next color:
 * those picked, or those at its depth beneath the root.
 */
function listTags(
  field: EventGroupField,
  level: EventGroupLevel,
): ColorLegendEntry[] {
  const picked = level.tags ?? [];
  const entries: ColorLegendEntry[] = [];

  for (const option of field.options) {
    const isShown =
      picked.length > 0
        ? picked.includes(option.value)
        : readDepth(option) === (level.depth ?? 1) - 1;

    if (isShown) {
      entries.push({
        color: pickColor(entries.length),
        key: option.value,
        label: option.label,
      });
    }
  }

  return entries;
}

/**
 * The values of a derived field that are known ahead, each with the next
 * color: the weekdays, the hours and the duration buckets. A period, such as
 * a month, has too many to list, and none here.
 */
function listValues(field: EventGroupField): ColorLegendEntry[] {
  const keys: { key: string; label: string }[] = [];

  switch (field.id) {
    case "duration": {
      for (const bucket of DURATION_BUCKETS) {
        keys.push({ key: bucket.value, label: bucket.label });
      }

      break;
    }
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

  return keys.map((entry, position) => ({
    ...entry,
    color: pickColor(position),
  }));
}

/**
 * The color at a position in the palette, which starts over after its last.
 */
function pickColor(position: number): string {
  return String(COLOR_PALETTE[position % COLOR_PALETTE.length]);
}
