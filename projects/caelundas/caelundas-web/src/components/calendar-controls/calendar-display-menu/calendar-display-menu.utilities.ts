import { Galaxy, Layers, Palette, Ruler, Shapes } from "lucide-react";
import { createElement } from "react";

import {
  toConstellationsChange,
  toEclipticChange,
  toVisibilityChange,
} from "../../../hooks/use-night-sky/night-sky-controls.utilities";
import {
  TIMELINE_SCALE_LABELS,
  TIMELINE_SCALES,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { toGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import {
  CONSTELLATION_CHOICES,
  DEFAULT_COLOR_BY,
  NO_COLOR,
} from "./calendar-display-menu.constants";
import {
  applySkyLeaf,
  createSkyItems,
  toSkyValue,
} from "./calendar-display-sky.utilities";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type { SkySearchChange } from "../../../hooks/use-night-sky/night-sky-controls.types";
import type { ConstellationListing } from "../../../hooks/use-night-sky/night-sky.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupField } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
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
  const skyContext = {
    listing: choices.listing,
    onSkyChange,
    settings: choices.sky,
  };
  const colon = leaf.indexOf(":");
  const group = colon === -1 ? leaf : leaf.slice(0, colon);
  const value = colon === -1 ? "" : leaf.slice(colon + 1);
  const actions: Readonly<Record<string, () => void>> = {
    clusters: () => {
      handlers.handleClustersChange(!choices.clusters);
    },
    colorBy: () => {
      if (value === NO_COLOR) {
        handlers.handleColorsChange(false);

        return;
      }

      const field = fields.find((candidate) => candidate.id === value);

      handlers.handleColorsChange(true);
      handlers.handleColorByChange(
        field === undefined ? undefined : toGroupLevel(field),
      );
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
  fields: readonly EventGroupField[],
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
        { label: "None", value: `colorBy:${NO_COLOR}` },
        { label: "Event kind", value: `colorBy:${DEFAULT_COLOR_BY}` },
        ...fields.map((field) => ({
          description: field.description,
          label: field.label,
          value: `colorBy:${field.id}`,
        })),
      ],
      icon: toIcon(Palette),
      label: "Color",
      value: "branch:color",
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
    ...(choices.view === "timeline" ? [`scale:${choices.scale}`] : []),
    `symbols:${choices.symbols}`,
    ...(choices.clusters ? ["clusters"] : []),
    `colorBy:${choices.colors ? (choices.colorBy?.field ?? DEFAULT_COLOR_BY) : NO_COLOR}`,
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
