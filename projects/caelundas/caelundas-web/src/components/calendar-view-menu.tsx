import { ChevronDown, Eye } from "lucide-react";

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { EVENT_COLOR_RULES } from "../lib/calendar/calendar-colors";
import { compileEventFilter } from "../lib/event-filters/event-filter-compiler";
import { EMPTY_EVENT_FILTER } from "../lib/event-filters/event-filter-tree";

import type { ResolvedEventFilterCollection } from "../lib/event-filters/event-filter-collections";
import type { EventFilterQuery } from "../lib/event-filters/event-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The collections of filters to offer, the filter tree the calendar holds,
 * whether events are colored by type, and where to send a change to either.
 */
export interface CalendarViewMenuProperties {
  /**
   * More of the menu, drawn ahead of its own sections: what the view shown
   * can be arranged by.
   */
  children?: ReactNode;
  className?: string;
  /**
   * Whether the views of hours merge events that run together.
   */
  clusters: boolean;
  collections: readonly ResolvedEventFilterCollection[];
  colors: boolean;
  onClustersChange: (enabled: boolean) => void;
  onColorsChange: (enabled: boolean) => void;
  onSelect: (filter: EventFilterQuery) => void;
  query: EventFilterQuery;
}

const ALL_EVENTS_ID = "all-events";
const CUSTOM_ID = "custom";

// 🧩 Component

/**
 * Renders the View menu: what the calendar shows and how it looks. It lists
 * the collections of filters, marking the one whose filters the tree holds,
 * "All events" when the tree filters nothing, and anything else as custom, an
 * edit made in the builder; then whether events are colored by their type,
 * with a legend of the colors in a submenu.
 */
export function CalendarViewMenu(
  properties: Readonly<CalendarViewMenuProperties>,
): ReactNode {
  const {
    children,
    className,
    clusters,
    collections,
    colors,
    onClustersChange,
    onColorsChange,
    onSelect,
    query,
  } = properties;

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

  const currentName =
    collections.find((collection) => collection.id === value)?.name ??
    (value === ALL_EVENTS_ID ? "All events" : "Custom");

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-view-menu"
    >
      <ButtonGroup aria-label="View menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`View options, ${currentName}`}
                size="sm"
                title={currentName}
                variant="outline"
              />
            }
          >
            <Eye aria-hidden="true" />
            View
            <ChevronDown
              aria-hidden="true"
              className="opacity-60"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-80 max-w-[95vw]"
          >
            {children}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Collections</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuRadioGroup
              onValueChange={(next: unknown) => {
                const collection = collections.find(
                  (candidate) => candidate.id === next,
                );

                onSelect(collection?.filter ?? EMPTY_EVENT_FILTER);
              }}
              value={value}
            >
              <CollectionOptions collections={collections} />
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Colors</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={colors}
                onCheckedChange={(checked) => {
                  onColorsChange(checked);
                }}
              >
                Color events by type
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Color legend</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                <ColorLegend />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Crowded days</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={clusters}
                onCheckedChange={(checked) => {
                  onClustersChange(checked);
                }}
              >
                Group similar events
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}

/**
 * Lists each collection with what it holds, then "All events".
 */
function CollectionOptions(
  properties: Readonly<{
    collections: readonly ResolvedEventFilterCollection[];
  }>,
): ReactNode {
  const { collections } = properties;

  return (
    <>
      {collections.map((collection) => (
        <DropdownMenuRadioItem
          key={collection.id}
          value={collection.id}
          closeOnClick
        >
          <span className="flex flex-col gap-0.5">
            <span>{collection.name}</span>
            <span className="text-xs whitespace-normal text-muted-foreground">
              {collection.description}
            </span>
          </span>
        </DropdownMenuRadioItem>
      ))}
      <DropdownMenuRadioItem
        value={ALL_EVENTS_ID}
        closeOnClick
      >
        <span className="flex flex-col gap-0.5">
          <span>All events</span>
          <span className="text-xs whitespace-normal text-muted-foreground">
            No filters: every event in the data.
          </span>
        </span>
      </DropdownMenuRadioItem>
    </>
  );
}

/**
 * Names the color of each type of event.
 */
function ColorLegend(): ReactNode {
  return (
    <ul className="grid gap-1 p-2">
      {EVENT_COLOR_RULES.map((rule) => (
        <li
          key={rule.path}
          className="flex items-center gap-2 text-xs"
        >
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: rule.color }}
          />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
