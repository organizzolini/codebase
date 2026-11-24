import { Eye } from "lucide-react";
import { createElement, useState } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { QueryCascader } from "../query-cascader/query-cascader";
import { TagIcon } from "../tag-icon/tag-icon";

import {
  CHIP_CLASS_NAME,
  CUSTOM_ID,
  DEFAULT_VIEW_ICON,
  TITLE,
  VIEW_ICONS,
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

/** Renders the View button, opening a searchable preset list, joined to a chip naming the matching preset, else Custom. */
export function CalendarViewStrip(
  properties: Readonly<CalendarViewStripProperties>,
): ReactNode {
  const { className, onSelect, presets, query } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup
  const choices = listViewChoices(presets);
  const items = choices.map((choice) => ({
    description: choice.description,
    icon: createElement(TagIcon, { name: choice.icon }),
    label: choice.label,
    value: choice.id,
  }));
  const activeId = findActiveViewId(presets, query);
  const active =
    activeId === CUSTOM_ID
      ? "Custom"
      : choices.find((choice) => choice.id === activeId)?.label;
  const activeIcon = VIEW_ICONS[activeId] ?? DEFAULT_VIEW_ICON;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-view-strip"
    >
      <ButtonGroup aria-label="Saved view">
        <Popover
          onOpenChange={setIsOpen}
          open={isOpen}
        >
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
        <Button
          className={CHIP_CLASS_NAME}
          onClick={() => {
            setIsOpen(true);
          }}
          size="sm"
          variant="outline"
        >
          <TagIcon name={activeIcon} />
          {active}
        </Button>
      </ButtonGroup>
    </div>
  );
}
