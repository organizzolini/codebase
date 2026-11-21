import {
  CalendarClock,
  Galaxy,
  Layers,
  Palette,
  Ruler,
  Shapes,
  Star,
} from "lucide-react";
import { createElement } from "react";

import {
  toConstellationsChange,
  toEclipticChange,
  toVisibilityChange,
} from "../../calendar-appearance/night-sky-menu/night-sky-menu.utilities";
import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
  TIMELINE_SCALE_LABELS,
  TIMELINE_SCALES,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { parseCalendarView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { toGroupLevel } from "../../calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities";

import {
  CONSTELLATION_CHOICES,
  DEFAULT_COLOR_BY,
  VIEW_ICONS,
} from "./calendar-display-menu.constants";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { SkySearchChange } from "../../calendar-appearance/night-sky-menu/night-sky-menu.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupField } from "../../calendar-query/calendar-group-by/components/event-group-model/event-groups.types";
import type { DisplayChoices } from "./calendar-display-menu.types";
import type { CascaderNode } from "@codebase/presentation";
import type { LucideIcon } from "lucide-react";

// 🔏 Private Functions

/**
 * Writes a choice to the link: a switch flips, and one of several is set, so clearing the one set changes nothing.
 */
export function applyDisplayLeaf(
  leaf: string,
  context: Readonly<{
    choices: DisplayChoices;
    fields: readonly EventGroupField[];
    handlers: UseCalendarDisplayResult["handlers"];
    onSkyChange: (change: SkySearchChange) => void;
  }>,
): void {
  const { choices, fields, handlers, onSkyChange } = context;
  const colon = leaf.indexOf(":");
  const group = colon === -1 ? leaf : leaf.slice(0, colon);
  const value = colon === -1 ? "" : leaf.slice(colon + 1);
  const actions: Readonly<Record<string, () => void>> = {
    calendar: () => {
      const view = parseCalendarView(value);

      if (view !== undefined) {
        handlers.handleViewChange(view);
      }
    },
    clusters: () => {
      handlers.handleClustersChange(!choices.clusters);
    },
    colorBy: () => {
      const field = fields.find((candidate) => candidate.id === value);

      handlers.handleColorByChange(
        field === undefined ? undefined : toGroupLevel(field),
      );
    },
    colors: () => {
      handlers.handleColorsChange(!choices.colors);
    },
    constellations: () => {
      const choice = CONSTELLATION_CHOICES.find(
        (candidate) => candidate.value === value,
      );

      if (choice !== undefined) {
        onSkyChange(toConstellationsChange(choice.words));
      }
    },
    scale: () => {
      const scale = TIMELINE_SCALES.find((candidate) => candidate === value);

      if (scale !== undefined) {
        handlers.handleScaleChange(scale);
      }
    },
    sky: () => {
      onSkyChange(
        value === "ecliptic"
          ? toEclipticChange(!choices.ecliptic)
          : toVisibilityChange(choices.skyOff),
      );
    },
    symbols: () => {
      handlers.handleSymbolsChange(value === "emojis" ? "emojis" : "glyphs");
    },
  };

  actions[group]?.();
}

// 🌎 Public Functions

/**
 * The nested choices: each part of how the calendar looks, with its own icon; the scale only where the timeline has one.
 */
export function createDisplayItems(
  fields: readonly EventGroupField[],
  view: CalendarViewName,
): CascaderNode[] {
  const scale: CascaderNode[] =
    view === "timeline"
      ? [
          {
            children: TIMELINE_SCALES.map((value) => ({
              label: TIMELINE_SCALE_LABELS[value],
              value: `scale:${value}`,
            })),
            icon: toIcon(Ruler),
            label: "Scale",
            value: "branch:scale",
          },
        ]
      : [];

  return [
    {
      children: CALENDAR_VIEWS.map((value) => ({
        icon: toIcon(VIEW_ICONS[value]),
        label: CALENDAR_VIEW_LABELS[value],
        value: `calendar:${value}`,
      })),
      icon: toIcon(CalendarClock),
      label: "Calendar",
      value: "branch:calendar",
    },
    ...scale,
    {
      children: [
        { label: "Glyphs", value: "symbols:glyphs" },
        { label: "Emojis", value: "symbols:emojis" },
      ],
      icon: toIcon(Shapes),
      label: "Symbols",
      value: "branch:symbols",
    },
    {
      children: [{ label: "Group similar events", value: "clusters" }],
      icon: toIcon(Layers),
      label: "Crowded days",
      value: "branch:crowded",
    },
    {
      children: [
        { label: "Color events", value: "colors" },
        {
          children: [
            { label: "Event kind", value: `colorBy:${DEFAULT_COLOR_BY}` },
            ...fields.map((field) => ({
              description: field.description,
              label: field.label,
              value: `colorBy:${field.id}`,
            })),
          ],
          icon: toIcon(Palette),
          label: "Color by",
          value: "branch:color-by",
        },
      ],
      icon: toIcon(Palette),
      label: "Color",
      value: "branch:color",
    },
    {
      children: [
        { label: "Show the sky", value: "sky:visible" },
        { label: "Ecliptic", value: "sky:ecliptic" },
        {
          children: CONSTELLATION_CHOICES.map((choice) => ({
            label: choice.label,
            value: `constellations:${choice.value}`,
          })),
          icon: toIcon(Star),
          label: "Constellations",
          value: "branch:constellations",
        },
      ],
      icon: toIcon(Galaxy),
      label: "Sky",
      value: "branch:sky",
    },
  ];
}

/**
 * Names a choice of figures as the list offers it, or custom when it is none of them.
 */
export function describeConstellations(words: readonly string[]): string {
  return (
    CONSTELLATION_CHOICES.find(
      (choice) => choice.words.join(",") === words.join(","),
    )?.value ?? "custom"
  );
}

/**
 * The one choice a click added to or took from what was ticked.
 */
export function findToggledLeaf(
  previous: readonly string[],
  next: readonly string[],
): string | undefined {
  return [
    ...previous.filter((leaf) => !next.includes(leaf)),
    ...next.filter((leaf) => !previous.includes(leaf)),
  ][0];
}

/**
 * What to tick in the list for the choices the link makes.
 */
export function toDisplayValue(choices: DisplayChoices): string[] {
  return [
    `calendar:${choices.view}`,
    ...(choices.view === "timeline" ? [`scale:${choices.scale}`] : []),
    `symbols:${choices.symbols}`,
    ...(choices.clusters ? ["clusters"] : []),
    ...(choices.colors ? ["colors"] : []),
    `colorBy:${choices.colorBy?.field ?? DEFAULT_COLOR_BY}`,
    ...(choices.skyOff ? [] : ["sky:visible"]),
    ...(choices.ecliptic ? ["sky:ecliptic"] : []),
    `constellations:${describeConstellations(choices.constellations)}`,
  ];
}

/**
 * An icon as the element a node draws.
 */
function toIcon(icon: LucideIcon): CascaderNode["icon"] {
  return createElement(icon, { "aria-hidden": "true" });
}
