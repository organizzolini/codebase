import { Galaxy, Palette, SlidersHorizontal } from "lucide-react";
import { createElement, useMemo, useState } from "react";

import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useCalendarDisplay } from "../../../hooks/use-calendar-display/use-calendar-display";
import { CALENDAR_VIEW_LABELS } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { createEventGroupFields } from "../../calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities";
import { QueryCascader } from "../../calendar-query/query-cascader/query-cascader";

import {
  CHIP_CLASS_NAME,
  STRIP_CLASS_NAME,
  TITLE,
} from "./calendar-display-menu.constants";
import {
  applyDisplayLeaf,
  createDisplayItems,
  findToggledLeaf,
  toDisplayValue,
} from "./calendar-display-menu.utilities";
import { DisplayPanelDialog } from "./components/display-panel-dialog/display-panel-dialog";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-by/components/event-group-model/event-groups.types";
import type { DisplayPanel } from "./calendar-display-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the events are colored by, the data's facets, the zone, and the view shown.
 */
export interface CalendarDisplayMenuProperties {
  className?: string;
  colorBy: EventGroupLevel | undefined;
  facets: readonly EventFacet[];
  timeZone: string;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the Display button, which opens a nested, searchable list of how the calendar looks, with the Calendar, Color and Sky options in it, and footer actions for their full panels; a chip names the view shown.
 */
export function CalendarDisplayMenu(
  properties: Readonly<CalendarDisplayMenuProperties>,
): ReactNode {
  const { className, colorBy, facets, timeZone, view } = properties;

  // 🪝 Hooks
  const { change, handlers, sky, state } = useCalendarDisplay(timeZone);
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<DisplayPanel>();
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const items = useMemo(() => createDisplayItems(fields, view), [fields, view]);

  // 🏗 Setup
  const choices = {
    ...state,
    colorBy,
    constellations: sky.constellations,
    ecliptic: sky.ecliptic,
    skyOff: sky.off,
    view,
  };
  const value = toDisplayValue(choices);
  const openPanel = (next: DisplayPanel): void => {
    setIsOpen(false);
    setPanel(next);
  };

  // 💪 Handlers
  const handleValueChange = (next: string[]): void => {
    const leaf = findToggledLeaf(value, next);

    if (leaf !== undefined) {
      applyDisplayLeaf(leaf, {
        choices,
        fields,
        handlers,
        onSkyChange: change,
      });
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-display-menu"
    >
      <ButtonGroup
        aria-label={TITLE}
        className={STRIP_CLASS_NAME}
      >
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
                <SlidersHorizontal aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Display options"
            className="w-72 max-w-[90vw] p-0"
          >
            <QueryCascader
              actions={[
                {
                  icon: createElement(Palette, { "aria-hidden": "true" }),
                  label: "Color settings…",
                  onSelect: () => {
                    openPanel("color");
                  },
                },
                {
                  icon: createElement(Galaxy, { "aria-hidden": "true" }),
                  label: "Sky settings…",
                  onSelect: () => {
                    openPanel("sky");
                  },
                },
              ]}
              cascade={false}
              items={items}
              onValueChange={handleValueChange}
              placeholder="Search display options"
              value={value}
              multiple
            />
          </PopoverContent>
        </Popover>
        <ButtonGroupText className={CHIP_CLASS_NAME}>
          {CALENDAR_VIEW_LABELS[view]}
        </ButtonGroupText>
      </ButtonGroup>
      <DisplayPanelDialog
        colorBy={colorBy}
        colors={state.colors}
        facets={facets}
        onClose={() => {
          setPanel(undefined);
        }}
        onColorByChange={handlers.handleColorByChange}
        onColorsChange={handlers.handleColorsChange}
        panel={panel}
      />
    </div>
  );
}
