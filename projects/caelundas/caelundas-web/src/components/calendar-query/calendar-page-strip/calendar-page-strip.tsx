import { Layers } from "lucide-react";
import { use } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useStripLines } from "../../../hooks/use-strip-lines/use-strip-lines";
import { BUTTON_STRIP_CLASS_NAME } from "../../../hooks/use-strip-lines/use-strip-lines.constants";
import { TableGroupsContext } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";

import { TITLE } from "./calendar-page-strip.constants";
import { clampPages, getPageCount } from "./calendar-page-strip.utilities";
import { PageMenu } from "./components/page-menu/page-menu";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The view, which has pages only in the table. */
export interface CalendarPageStripProperties {
  className?: string;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Page button, opening page sizes and a checkbox per page, beside the range of events shown. */
export function CalendarPageStrip(
  properties: Readonly<CalendarPageStripProperties>,
): ReactNode {
  const { className, view } = properties;

  // 🪝 Hooks
  const { reference } = useStripLines(view === "table");
  const { dispatch, state } = use(TableGroupsContext);

  // 🏗 Setup
  const { limit, stats } = state;
  const count = getPageCount(stats.longest, limit);
  const pages = clampPages(state.pages, count);

  const range = `${stats.shown === 0 ? 0 : 1} to ${stats.shown} of ${stats.total}`;
  const content = (
    <PopoverContent
      align="start"
      aria-label="Pages"
      className="w-64 max-w-[90vw] p-3"
    >
      <PageMenu
        count={count}
        limit={limit}
        longest={stats.longest}
        onLimitChange={(next) => {
          dispatch({ limit: next, type: "set-limit" });
        }}
        onPagesChange={(next) => {
          dispatch({ pages: next, type: "set-pages" });
        }}
        pages={pages}
      />
    </PopoverContent>
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "table") {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-page-strip"
    >
      <ButtonGroup
        ref={reference}
        aria-label={TITLE}
        className={BUTTON_STRIP_CLASS_NAME}
        data-strip-buttons=""
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <Layers aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          {content}
        </Popover>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                aria-label={`${TITLE} ${range}`}
                size="sm"
                variant="outline"
              >
                {range}
              </Button>
            }
          />
          {content}
        </Popover>
      </ButtonGroup>
    </div>
  );
}
