import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@codebase/presentation";

import { compileEventFilter } from "../lib/event-filters/event-filter-compiler";
import { EMPTY_EVENT_FILTER } from "../lib/event-filters/event-filter-tree";

import type { ResolvedEventFilterCollection } from "../lib/event-filters/event-filter-collections";
import type { EventFilterQuery } from "../lib/event-filters/event-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The collections of filters to offer, the filter tree the calendar holds,
 * and where to send a collection picked.
 */
export interface CalendarCollectionPickerProperties {
  className?: string;
  collections: readonly ResolvedEventFilterCollection[];
  onSelect: (filter: EventFilterQuery) => void;
  query: EventFilterQuery;
}

const ALL_EVENTS_ID = "all-events";
const CUSTOM_ID = "custom";

// 🧩 Component

/**
 * Renders the collection the filters below come from, as a dropdown to pick
 * another from. The collection whose filters
 * the tree holds is the one shown, "All events" when the tree filters
 * nothing, and anything else as custom, an edit made in the builder.
 */
export function CalendarCollectionPicker(
  properties: Readonly<CalendarCollectionPickerProperties>,
): ReactNode {
  const { className, collections, onSelect, query } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  // The compiled SQL says whether two trees filter alike, whatever their ids.
  const current = JSON.stringify(compileEventFilter(query));
  let value = current === "null" ? ALL_EVENTS_ID : CUSTOM_ID;

  for (const collection of collections) {
    if (JSON.stringify(compileEventFilter(collection.filter)) === current) {
      value = collection.id;
    }
  }

  const items = [
    ...collections.map((collection) => ({
      label: collection.name,
      value: collection.id,
    })),
    { label: "All events", value: ALL_EVENTS_ID },
    ...(value === CUSTOM_ID ? [{ label: "Custom", value: CUSTOM_ID }] : []),
  ];

  // 💪 Handlers
  const handleChange = (picked: unknown): void => {
    const collection = collections.find((candidate) => candidate.id === picked);

    if (collection !== undefined || picked === ALL_EVENTS_ID) {
      onSelect(collection?.filter ?? EMPTY_EVENT_FILTER);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-collection-picker"
    >
      <Select
        items={items}
        onValueChange={handleChange}
        value={value}
      >
        <SelectTrigger
          aria-label="Collection"
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
