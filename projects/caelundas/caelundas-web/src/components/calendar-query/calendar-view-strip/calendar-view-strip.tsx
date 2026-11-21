import { Eye } from "lucide-react";

import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { QueryCascader } from "../query-cascader/query-cascader";

import {
  CHIP_CLASS_NAME,
  CUSTOM_ID,
  STRIP_CLASS_NAME,
  TITLE,
} from "./calendar-view-strip.constants";
import {
  findActiveViewId,
  getViewFilter,
  listViewChoices,
} from "./calendar-view-strip.utilities";

import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/components/presets/presets.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The presets offered, the filter tree shown, and the selection handler.
 */
export interface CalendarViewStripProperties {
  className?: string;
  onSelect: (filter: EventFilterQuery) => void;
  presets: readonly ResolvedPreset[];
  query: EventFilterQuery;
}

// 🧩 Component

/**
 * Renders the View button, which opens a searchable list of the presets in the nested list the other menus use, joined to a chip naming the one the filter tree matches, else Custom.
 */
export function CalendarViewStrip(
  properties: Readonly<CalendarViewStripProperties>,
): ReactNode {
  const { className, onSelect, presets, query } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const choices = listViewChoices(presets);
  const items = choices.map((choice) => ({
    description: choice.description,
    label: choice.label,
    value: choice.id,
  }));
  const activeId = findActiveViewId(presets, query);
  const active =
    activeId === CUSTOM_ID
      ? "Custom"
      : choices.find((choice) => choice.id === activeId)?.label;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-view-strip"
    >
      <ButtonGroup
        aria-label="Saved view"
        className={STRIP_CLASS_NAME}
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <Eye aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Search views"
            className="w-80 max-w-[90vw] p-0"
          >
            <QueryCascader
              items={items}
              onValueChange={([picked]) => {
                onSelect(getViewFilter(presets, picked));
              }}
              placeholder="Search views"
              value={
                choices.some((choice) => choice.id === activeId)
                  ? [activeId]
                  : []
              }
            />
          </PopoverContent>
        </Popover>
        <ButtonGroupText className={CHIP_CLASS_NAME}>{active}</ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}
