import {
  Galaxy,
  Layers,
  LayoutDashboard,
  Palette,
  Ruler,
  Shapes,
  Smile,
  Sparkles,
} from "lucide-react";
import { createElement } from "react";

import {
  toConstellationsChange,
  toEclipticChange,
  toVisibilityChange,
} from "../../../hooks/use-night-sky/hooks/use-night-sky-controls/night-sky-controls.utilities";
import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
  TIMELINE_SCALE_LABELS,
  TIMELINE_SCALES,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { parseCalendarView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";

import {
  CONSTELLATION_CHOICES,
  LAYOUT_BRANCH,
  SCALE_BRANCH,
  SCALE_ICONS,
  SYMBOLS_BRANCH,
  VIEW_ICONS,
} from "./calendar-display-menu.constants";
import {
  applySkyLeaf,
  createSkyItems,
  toSkyValue,
} from "./calendar-display-sky.utilities";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { SkySearchChange } from "../../../hooks/use-night-sky/hooks/use-night-sky-controls/night-sky-controls.types";
import type { ConstellationListing } from "../../../hooks/use-night-sky/night-sky.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
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
    handlers: UseCalendarDisplayResult["handlers"];
    onSkyChange: (change: SkySearchChange) => void;
  }>,
): void {
  const { choices, handlers, onSkyChange } = context;
  const skyContext = {
    listing: choices.listing,
    onSkyChange,
    settings: choices.sky,
  };
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
    colors: () => {
      handlers.handleColorsChange(!choices.colors);
    },
    constellation: () => {
      applySkyLeaf(group, value, skyContext);
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
    setting: () => {
      applySkyLeaf(group, value, skyContext);
    },
    sky: () => {
      if (value === "visible") {
        onSkyChange(toVisibilityChange(choices.sky.off));
      } else if (value === "ecliptic") {
        onSkyChange(toEclipticChange(!choices.sky.ecliptic));
      } else {
        applySkyLeaf(group, value, skyContext);
      }
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
  choices: Readonly<{
    listing: readonly ConstellationListing[];
    view: CalendarViewName;
  }>,
): CascaderNode[] {
  const { view } = choices;
  const scale: CascaderNode[] =
    view === "timeline"
      ? [
          {
            children: TIMELINE_SCALES.map((value) => ({
              icon: toIcon(SCALE_ICONS[value]),
              label: TIMELINE_SCALE_LABELS[value],
              radio: true,
              value: `scale:${value}`,
            })),
            icon: toIcon(Ruler),
            label: "Scale",
            value: SCALE_BRANCH,
          },
        ]
      : [];

  return [
    {
      children: CALENDAR_VIEWS.map((value) => ({
        icon: toIcon(VIEW_ICONS[value]),
        label: CALENDAR_VIEW_LABELS[value],
        radio: true,
        value: `calendar:${value}`,
      })),
      icon: toIcon(LayoutDashboard),
      label: "Layout",
      value: LAYOUT_BRANCH,
    },
    ...scale,
    {
      children: [
        {
          icon: toIcon(Shapes),
          label: "Glyphs",
          radio: true,
          value: "symbols:glyphs",
        },
        {
          icon: toIcon(Smile),
          label: "Emojis",
          radio: true,
          value: "symbols:emojis",
        },
      ],
      icon: toIcon(Sparkles),
      label: "Symbols",
      value: SYMBOLS_BRANCH,
    },
    {
      icon: toIcon(Palette),
      label: "Colors",
      value: "colors",
    },
    {
      description: "Group similar events",
      icon: toIcon(Layers),
      label: "Crowded days",
      value: "clusters",
    },
    {
      children: createSkyItems(choices.listing),
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
    `constellations:${describeConstellations(choices.sky.constellations)}`,
    ...toSkyValue(choices.sky, choices.listing),
  ];
}

/**
 * An icon as the element a node draws.
 */
function toIcon(icon: LucideIcon): CascaderNode["icon"] {
  return createElement(icon, { "aria-hidden": "true" });
}
