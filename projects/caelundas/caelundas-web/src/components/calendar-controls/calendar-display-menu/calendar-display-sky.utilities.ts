import { createElement } from "react";

import {
  ANGLE_SLIDERS,
  BACKGROUND_COLORS,
  ECLIPTIC_COLOR,
  ECLIPTIC_SLIDERS,
  LINE_COLOR,
  LINE_SLIDERS,
  OPACITY_SLIDERS,
  SKY_COLORS,
  SKY_SLIDERS,
  STAR_SLIDERS,
} from "../../../hooks/use-night-sky/night-sky-controls.constants";
import {
  listShownFigures,
  toConstellationsChange,
  toggleFigure,
  toResetChange,
  toSkyParameterChange,
} from "../../../hooks/use-night-sky/night-sky-controls.utilities";

import {
  COLOR_SWATCHES,
  CONSTELLATION_CHOICES,
  STEP_COUNT,
} from "./calendar-display-menu.constants";

import type {
  SkyColorControl,
  SkySearchChange,
  SkySliderControl,
} from "../../../hooks/use-night-sky/night-sky-controls.types";
import type { ConstellationListing } from "../../../hooks/use-night-sky/night-sky.types";
import type { NightSkyOverrides } from "../../../hooks/use-night-sky/use-night-sky.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * Writes a pick from the Sky's options: one figure shown or hidden, one setting set, or the sky put back to its default.
 */
export function applySkyLeaf(
  group: string,
  value: string,
  context: Readonly<{
    listing: readonly ConstellationListing[];
    onSkyChange: (change: SkySearchChange) => void;
    settings: NightSkyOverrides;
  }>,
): void {
  const { listing, onSkyChange, settings } = context;

  if (group === "constellation") {
    onSkyChange(
      toConstellationsChange(
        toggleFigure(settings.constellations, listing, value),
      ),
    );
  } else if (group === "sky") {
    onSkyChange(toResetChange());
  } else {
    const separator = value.indexOf("=");
    const key = value.slice(0, separator);
    const picked = value.slice(separator + 1);
    const slider = SKY_SLIDERS.find((candidate) => candidate.key === key);
    const parameter =
      slider ?? SKY_COLORS.find((candidate) => candidate.key === key);

    if (parameter !== undefined) {
      onSkyChange(
        toSkyParameterChange(
          parameter.key,
          slider === undefined ? picked : Number(picked),
        ),
      );
    }
  }
}

/**
 * The Sky's options: whether it shows, which figures, and each setting as a few values to pick.
 */
export function createSkyItems(
  listing: readonly ConstellationListing[],
): CascaderNode[] {
  const zodiac: CascaderNode[] = [];
  const others: CascaderNode[] = [];
  const choices: CascaderNode[] = [];

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const constellation of listing) {
    (constellation.zodiac ? zodiac : others).push({
      label: constellation.name,
      value: `constellation:${constellation.name}`,
    });
  }

  for (const choice of CONSTELLATION_CHOICES) {
    choices.push({
      label: choice.label,
      value: `constellations:${choice.value}`,
    });
  }

  return [
    { label: "Show the sky", value: "sky:visible" },
    { label: "Default sky", value: "sky:reset" },
    {
      children: [
        ...choices,
        { children: zodiac, label: "Zodiac figures", value: "branch:zodiac" },
        { children: others, label: "Other figures", value: "branch:others" },
      ],
      label: "Constellations",
      value: "branch:constellations",
    },
    createSettingsBranch("Ecliptic", {
      colors: [ECLIPTIC_COLOR],
      leaves: [{ label: "Show the ecliptic", value: "sky:ecliptic" }],
      sliders: ECLIPTIC_SLIDERS,
    }),
    createSettingsBranch("Constellation lines", {
      colors: [LINE_COLOR],
      leaves: [],
      sliders: LINE_SLIDERS,
    }),
    createSettingsBranch("Opacity", {
      colors: [],
      leaves: [],
      sliders: OPACITY_SLIDERS,
    }),
    createSettingsBranch("Stars", {
      colors: [],
      leaves: [],
      sliders: STAR_SLIDERS,
    }),
    createSettingsBranch("Angles", {
      colors: [],
      leaves: [],
      sliders: ANGLE_SLIDERS,
    }),
    createSettingsBranch("Background", {
      colors: BACKGROUND_COLORS,
      leaves: [],
      sliders: [],
    }),
  ];
}

/**
 * What to tick for the sky: its switches, the figures drawn, each setting's nearest value and each color it is set to.
 */
export function toSkyValue(
  settings: NightSkyOverrides,
  listing: readonly ConstellationListing[],
): string[] {
  const value: string[] = [];

  if (!settings.off) {
    value.push("sky:visible");
  }

  if (settings.ecliptic) {
    value.push("sky:ecliptic");
  }

  for (const name of listShownFigures(settings.constellations, listing)) {
    value.push(`constellation:${name}`);
  }

  for (const control of SKY_SLIDERS) {
    value.push(
      `setting:${control.key}=${String(findNearestStep(control, settings[control.field]))}`,
    );
  }

  for (const control of SKY_COLORS) {
    for (const swatch of COLOR_SWATCHES) {
      if (swatch.value === settings[control.field].toLowerCase()) {
        value.push(`setting:${control.key}=${swatch.value}`);
      }
    }
  }

  return value;
}

/**
 * A branch of settings: each number and color a few values to pick, after any leaves of its own.
 */
function createSettingsBranch(
  label: string,
  controls: Readonly<{
    colors: readonly SkyColorControl[];
    leaves: readonly CascaderNode[];
    sliders: readonly SkySliderControl[];
  }>,
): CascaderNode {
  const children: CascaderNode[] = [...controls.leaves];

  for (const control of controls.sliders) {
    children.push({
      children: createStepItems(control),
      label: control.label,
      value: `branch:${control.key}`,
    });
  }

  for (const control of controls.colors) {
    children.push({
      children: createSwatchItems(control),
      label: control.label,
      value: `branch:${control.key}`,
    });
  }

  return { children, label, value: `branch:sky-${label}` };
}

// 🌎 Public Functions

/**
 * The values a numeric setting offers: evenly spaced from its least to its most, to its step.
 */
function createStepItems(control: SkySliderControl): CascaderNode[] {
  const steps: CascaderNode[] = [];
  const spread = control.maximum - control.minimum;
  const decimals = String(control.step).split(".")[1]?.length ?? 0;
  const seen = new Set<number>();

  for (let index = 0; index < STEP_COUNT; index += 1) {
    const step = Number(
      (control.minimum + (spread * index) / (STEP_COUNT - 1)).toFixed(decimals),
    );

    if (!seen.has(step)) {
      seen.add(step);
      steps.push({
        label: `${String(step)}${control.unit}`,
        value: `setting:${control.key}=${String(step)}`,
      });
    }
  }

  return steps;
}

/**
 * The colors a color setting offers, each with its swatch.
 */
function createSwatchItems(control: SkyColorControl): CascaderNode[] {
  const swatches: CascaderNode[] = [];

  for (const swatch of COLOR_SWATCHES) {
    swatches.push({
      icon: createElement("span", {
        "aria-hidden": "true",
        className: "inline-block size-3 rounded-full border",
        style: { backgroundColor: swatch.value },
      }),
      label: swatch.label,
      value: `setting:${control.key}=${swatch.value}`,
    });
  }

  return swatches;
}

/**
 * The step a setting is nearest, which is the one the list ticks.
 */
function findNearestStep(control: SkySliderControl, value: number): number {
  const spread = control.maximum - control.minimum;
  const decimals = String(control.step).split(".")[1]?.length ?? 0;
  const clamped = Math.min(Math.max(value, control.minimum), control.maximum);
  const index = Math.round(
    ((clamped - control.minimum) / spread) * (STEP_COUNT - 1),
  );

  return Number(
    (control.minimum + (spread * index) / (STEP_COUNT - 1)).toFixed(decimals),
  );
}
