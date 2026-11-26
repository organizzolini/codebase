import {
  EyeOff,
  Galaxy,
  GitCompareArrows,
  Palette,
  Sparkles,
} from "lucide-react";
import { createElement } from "react";

import {
  toConstellationsChange,
  toEclipticChange,
  toVisibilityChange,
} from "../../../hooks/use-night-sky/hooks/use-night-sky-controls/night-sky-controls.utilities";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { hasGroupRows } from "../../calendar-query/calendar-group-strip/calendar-group-strip.utilities";

import {
  CONSTELLATION_CHOICES,
  DISPLAY_DESCRIPTIONS,
  SYMBOL_CHOICES,
  SYMBOLS_BRANCH,
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
    colors: () => {
      handlers.handleColorsChange(!choices.colors);
    },
    compare: () => {
      handlers.handleCompareChange(!choices.compare);
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
    hideEmpty: () => {
      handlers.handleHideEmptyChange(!choices.hideEmpty);
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
 * The nested choices: each part of how the calendar looks, with its own icon.
 */
export function createDisplayItems(
  choices: Readonly<{
    listing: readonly ConstellationListing[];
    view?: CalendarViewName;
  }>,
): CascaderNode[] {
  return describeItems([
    {
      children: (["glyphs", "emojis"] as const).map((symbols) => ({
        icon: toIcon(SYMBOL_CHOICES[symbols].icon),
        label: SYMBOL_CHOICES[symbols].label,
        radio: true,
        value: `symbols:${symbols}`,
      })),
      icon: toIcon(Sparkles),
      label: "Symbols",
      value: SYMBOLS_BRANCH,
    },
    {
      icon: toIcon(Palette),
      label: "Colors",
      value: "colors",
    },
    ...(isMetricView(choices.view)
      ? [
          {
            icon: toIcon(GitCompareArrows),
            label: "Compare to previous period",
            value: "compare",
          },
        ]
      : []),
    ...(choices.view !== undefined && hasGroupRows(choices.view)
      ? [
          {
            icon: toIcon(EyeOff),
            label: "Hide empty groups",
            value: "hideEmpty",
          },
        ]
      : []),
    {
      children: createSkyItems(choices.listing),
      icon: toIcon(Galaxy),
      label: "Skyfield",
      value: "branch:sky",
    },
  ]);
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
 * Whether a row can be picked: every one but the branches that only group.
 */
export function isDisplayChoice(node: Readonly<CascaderNode>): boolean {
  return !node.value.startsWith("branch:");
}

/**
 * What to tick in the list for the choices the link makes.
 */
export function toDisplayValue(choices: DisplayChoices): string[] {
  return [
    `symbols:${choices.symbols}`,
    ...(choices.colors ? ["colors"] : []),
    ...(choices.compare && isMetricView(choices.view) ? ["compare"] : []),
    ...(choices.hideEmpty && hasGroupRows(choices.view) ? ["hideEmpty"] : []),
    `constellations:${describeConstellations(choices.sky.constellations)}`,
    ...toSkyValue(choices.sky, choices.listing),
  ];
}

/**
 * The nodes with a description beneath each, from its value unless it has one.
 */
function describeItems(nodes: readonly CascaderNode[]): CascaderNode[] {
  const described: CascaderNode[] = [];

  for (const node of nodes) {
    const description = node.description ?? DISPLAY_DESCRIPTIONS[node.value];

    described.push({
      ...node,
      ...(description === undefined ? {} : { description }),
      ...(node.children === undefined
        ? {}
        : { children: describeItems(node.children) }),
    });
  }

  return described;
}

/**
 * An icon as the element a node draws.
 */
function toIcon(icon: LucideIcon): CascaderNode["icon"] {
  return createElement(icon, { "aria-hidden": "true" });
}
