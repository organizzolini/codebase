import { useId } from "react";

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
const SELECT_CLASS_NAME =
  "border-input bg-background h-8 w-full min-w-0 rounded-md border px-2 text-sm";

// 🧩 Component

/**
 * Renders the collection the filters below come from, as a list to pick
 * another from, with what the one picked holds. The collection whose filters
 * the tree holds is the one shown, "All events" when the tree filters
 * nothing, and anything else as custom, an edit made in the builder.
 */
export function CalendarCollectionPicker(
  properties: Readonly<CalendarCollectionPickerProperties>,
): ReactNode {
  const { className, collections, onSelect, query } = properties;

  // 🪝 Hooks
  const id = useId();

  // 🏗 Setup
  // The compiled SQL says whether two trees filter alike, whatever their ids.
  const current = JSON.stringify(compileEventFilter(query));
  let value = current === "null" ? ALL_EVENTS_ID : CUSTOM_ID;

  for (const collection of collections) {
    if (JSON.stringify(compileEventFilter(collection.filter)) === current) {
      value = collection.id;
    }
  }

  const description =
    collections.find((collection) => collection.id === value)?.description ??
    (value === ALL_EVENTS_ID
      ? "No filters: every event in the data."
      : "Your own filters, as edited below.");

  // 💪 Handlers
  const handleChange = (picked: string): void => {
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
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium"
          htmlFor={id}
        >
          Collection
        </label>
        <select
          className={SELECT_CLASS_NAME}
          id={id}
          onChange={(event) => {
            handleChange(event.target.value);
          }}
          value={value}
        >
          {collections.map((collection) => (
            <option
              key={collection.id}
              value={collection.id}
            >
              {collection.name}
            </option>
          ))}
          <option value={ALL_EVENTS_ID}>All events</option>
          {value === CUSTOM_ID ? (
            <option
              value={CUSTOM_ID}
              disabled
            >
              Custom
            </option>
          ) : null}
        </select>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  );
}
