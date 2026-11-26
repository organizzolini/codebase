import { Eye } from "lucide-react";
import { createElement, useMemo, useState } from "react";

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
  CUSTOM_VIEW_ICON,
  TITLE,
} from "./calendar-view-strip.constants";
import {
  findActiveViewId,
  getViewSelection,
  listViewChoices,
  resolveViews,
} from "./calendar-view-strip.utilities";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGrouping } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ViewSelection } from "./calendar-view-strip.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The facets, the link's filter, group and sort, and the handler.
 */
export interface CalendarViewStripProperties {
  className?: string;
  facets: readonly EventFacet[];
  group: EventGrouping | undefined;
  onSelect: (selection: ViewSelection) => void;
  query: EventFilterQuery;
  sort: readonly GroupSort[] | undefined;
}

// 🧩 Component

/** Renders the View button, opening a searchable list of views, joined to a chip naming the one the link matches, else Custom. */
export function CalendarViewStrip(
  properties: Readonly<CalendarViewStripProperties>,
): ReactNode {
  const { className, facets, group, onSelect, query, sort } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  const views = useMemo(() => resolveViews(facets), [facets]);

  // 🏗 Setup
  const choices = listViewChoices(views);
  const items = choices.map((choice) => ({
    description: choice.description,
    icon: createElement(TagIcon, { name: choice.icon }),
    label: choice.label,
    value: choice.id,
  }));
  const activeId = findActiveViewId(views, {
    filter: query,
    group: group === undefined ? undefined : [...group],
    sort: sort === undefined ? undefined : [...sort],
  });
  const active =
    activeId === CUSTOM_ID
      ? "Custom"
      : choices.find((choice) => choice.id === activeId)?.label;
  const activeIcon =
    views.find((view) => view.id === activeId)?.icon ?? CUSTOM_VIEW_ICON;

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
                const selection = getViewSelection(views, picked);

                if (selection !== undefined) {
                  onSelect(selection);
                  setIsOpen(false);
                }
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
