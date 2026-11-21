import {
  CUSTOM_NAME,
  VIEW_PRESETS,
  VIEW_STATE_KEYS,
} from "./gallery-view.constants";

import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";
import type { ViewPreset, ViewState } from "./gallery-view.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Builds the cascader's tree of views: Presets, holding each with its description.
 */
export function createViewNodes(
  presets: readonly ViewPreset[],
): CascaderNode[] {
  return [
    {
      children: presets.map((preset): CascaderNode => ({
        description: preset.description,
        keywords: [preset.description],
        label: preset.name,
        value: preset.id,
      })),
      label: "Presets",
      value: "presets",
    },
  ];
}

/**
 * Lists the presets the catalog can answer: those whose characteristics it holds.
 */
export function createViewPresets(
  characteristics: readonly GalleryCharacteristic[],
): ViewPreset[] {
  const keys = new Set(characteristics.map(({ key }) => key));

  return VIEW_PRESETS.filter((preset) =>
    preset.requires.every((key) => keys.has(key)),
  );
}

/**
 * What the View button says: the name of the preset in force, else Custom.
 */
export function describeView(
  presets: readonly ViewPreset[],
  current: ViewState,
): string {
  return (
    presets.find((preset) => isPresetActive(preset, current))?.name ??
    CUSTOM_NAME
  );
}

/**
 * Whether every part of the state is as the preset has it.
 */
export function isPresetActive(
  preset: ViewPreset,
  current: ViewState,
): boolean {
  return VIEW_STATE_KEYS.every(
    (key) => JSON.stringify(preset.state[key]) === JSON.stringify(current[key]),
  );
}
