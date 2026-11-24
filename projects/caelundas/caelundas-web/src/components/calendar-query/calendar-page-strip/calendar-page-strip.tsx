import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from "lucide-react";
import { use } from "react";

import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

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

/** Renders the Page button, opening the page sizes and a checkbox for each page, joined to buttons that step through the pages and say which events show: the first, how many, and out of how many. */
export function CalendarPageStrip(
  properties: Readonly<CalendarPageStripProperties>,
): ReactNode {
  const { className, view } = properties;

  // 🪝 Hooks
  const { dispatch, state } = use(TableGroupsContext);

  // 🏗 Setup
  const { limit, stats } = state;
  const count = getPageCount(stats.longest, limit);
  const pages = clampPages(state.pages, count);

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
      <ButtonGroup aria-label={TITLE}>
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
        </Popover>
        <Button
          aria-label="First page"
          disabled={pages <= 1}
          onClick={() => {
            dispatch({ pages: 1, type: "set-pages" });
          }}
          size="sm"
          variant="outline"
        >
          <ChevronsLeft aria-hidden="true" />
        </Button>
        <Button
          aria-label="Previous page"
          disabled={pages <= 1}
          onClick={() => {
            dispatch({ pages: pages - 1, type: "set-pages" });
          }}
          size="sm"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <ButtonGroupText>{stats.shown === 0 ? 0 : 1}</ButtonGroupText>
        <ButtonGroupText>to {stats.shown}</ButtonGroupText>
        <ButtonGroupText>of {stats.total}</ButtonGroupText>
        <Button
          aria-label="Next page"
          disabled={pages >= count}
          onClick={() => {
            dispatch({ pages: pages + 1, type: "set-pages" });
          }}
          size="sm"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button
          aria-label="Last page"
          disabled={pages >= count}
          onClick={() => {
            dispatch({ pages: count, type: "set-pages" });
          }}
          size="sm"
          variant="outline"
        >
          <ChevronsRight aria-hidden="true" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
