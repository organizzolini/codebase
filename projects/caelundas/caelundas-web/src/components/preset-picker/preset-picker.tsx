import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@codebase/presentation";

import { toEventFilterInput } from "../calendar-filters/event-filter-input.utilities";
import { EMPTY_EVENT_FILTER } from "../calendar-filters/event-filter-tree.constants";

import { ALL_EVENTS_ID, CUSTOM_ID } from "./preset-picker.constants";

import type { EventFilterQuery } from "../calendar-filters/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/presets.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The presets of filters to offer, the filter tree the calendar holds,
 * and where to send a preset picked.
 */
export interface PresetPickerProperties {
  className?: string;
  onSelect: (filter: EventFilterQuery) => void;
  presets: readonly ResolvedPreset[];
  query: EventFilterQuery;
}

// 🧩 Component

/**
 * Renders the preset the filters below come from, as a dropdown to pick
 * another from. The preset whose filters
 * the tree holds is the one shown, "All events" when the tree filters
 * nothing, and anything else as custom, an edit made in the builder.
 */
export function PresetPicker(
  properties: Readonly<PresetPickerProperties>,
): ReactNode {
  const { className, onSelect, presets, query } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  // The input the API is sent says whether two trees filter alike, whatever
  // their ids.
  const current = JSON.stringify(toEventFilterInput(query));
  let value = current === "null" ? ALL_EVENTS_ID : CUSTOM_ID;

  for (const preset of presets) {
    if (JSON.stringify(toEventFilterInput(preset.filter)) === current) {
      value = preset.id;
    }
  }

  const items = [
    ...presets.map((preset) => ({
      label: preset.name,
      value: preset.id,
    })),
    { label: "All events", value: ALL_EVENTS_ID },
    ...(value === CUSTOM_ID ? [{ label: "Custom", value: CUSTOM_ID }] : []),
  ];

  // 💪 Handlers
  const handleChange = (picked: unknown): void => {
    const preset = presets.find((candidate) => candidate.id === picked);

    if (preset !== undefined || picked === ALL_EVENTS_ID) {
      onSelect(preset?.filter ?? EMPTY_EVENT_FILTER);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="preset-picker"
    >
      <Select
        items={items}
        onValueChange={handleChange}
        value={value}
      >
        <SelectTrigger
          aria-label="Preset"
          className="w-full"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {items.map((item) => (
            <SelectItem
              key={item.value}
              disabled={item.value === CUSTOM_ID}
              value={item.value}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
