import { LAYOUT_NAMES, VIEW_STATE_KEYS } from "./gallery-view.constants";

import type { ViewPreset, ViewState } from "./gallery-view.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Builds the cascader's tree of views: Layout, holding the layouts, and Presets, holding the saved arrangements, each with its description.
 */
export function createViewNodes(
  presets: readonly ViewPreset[],
): CascaderNode[] {
  const parents: [string, string, ViewPreset["kind"]][] = [
    ["layout", "Layout", "layout"],
    ["presets", "Presets", "saved"],
  ];

  return parents.map(([value, label, kind]): CascaderNode => ({
    children: presets
      .filter((preset) => preset.kind === kind)
      .map((preset): CascaderNode => ({
        description: preset.description,
        keywords: [preset.description],
        label: preset.name,
        value: preset.id,
      })),
    label,
    value,
  }));
}

/**
 * What the View button says: the first saved view the state matches, the
 * default one aside, else the layout it is in.
 */
export function describeView(
  presets: readonly ViewPreset[],
  current: ViewState,
): string {
  return (
    presets.find(
      (preset) =>
        preset.kind === "saved" &&
        preset.isDefault === undefined &&
        isPresetActive(preset, current),
    )?.name ?? LAYOUT_NAMES[current.view]
  );
}

/**
 * Whether every part a view fixes is as the state has it.
 */
export function isPresetActive(
  preset: ViewPreset,
  current: ViewState,
): boolean {
  return VIEW_STATE_KEYS.every(
    (key) =>
      !(key in preset.state) ||
      JSON.stringify(preset.state[key]) === JSON.stringify(current[key]),
  );
}
