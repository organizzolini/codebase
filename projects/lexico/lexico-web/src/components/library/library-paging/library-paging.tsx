import { ChevronLeft, ChevronRight, Rows3 } from "lucide-react";

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { LIBRARY_TEXT_SEGMENT } from "../../library-strip/library-chip/library-chip.constants";
import { LIBRARY_LIMITS } from "../library-grid/library-grid-api.constants";

import { PAGING_DISABLED_ICON, PAGING_LABEL } from "./library-paging.constants";
import { formatRange, listPages } from "./library-paging.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The page and limit shown, how many pages there are, and what to call on a change.
 */
export interface LibraryPagingProperties {
  className?: string;
  limit: number;
  onLimit: (limit: number) => void;
  onPage: (page: number) => void;
  page: number;
  pageCount: number;
  /** How many authors the library holds in all, for the range shown. */
  totalCount: number;
}

// 🧩 Component

/**
 * The Page button and its menu of authors per page and the page to show, joined to previous and next buttons around the range of authors on view.
 */
export function LibraryPaging(
  properties: Readonly<LibraryPagingProperties>,
): ReactNode {
  const { className, limit, onLimit, onPage, page, pageCount, totalCount } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const pages = listPages(pageCount);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-paging"
    >
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
              />
            }
          >
            <Rows3 aria-hidden="true" />
            {PAGING_LABEL}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Per page</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                onValueChange={(value: string) => {
                  onLimit(Number(value));
                }}
                value={String(limit)}
              >
                {LIBRARY_LIMITS.map((option) => (
                  <DropdownMenuRadioItem
                    key={option}
                    value={String(option)}
                  >
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Go to page</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                onValueChange={(value: string) => {
                  onPage(Number(value));
                }}
                value={String(page)}
              >
                {pages.map((number) => (
                  <DropdownMenuRadioItem
                    key={number}
                    value={String(number)}
                  >
                    {`Page ${String(number)}`}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          aria-disabled={page <= 1}
          aria-label="Previous page"
          onClick={() => {
            if (page > 1) {
              onPage(page - 1);
            }
          }}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft
            aria-hidden="true"
            className={PAGING_DISABLED_ICON}
          />
        </Button>
        <div
          className={LIBRARY_TEXT_SEGMENT}
          data-slot="button"
        >
          {formatRange(page, limit, totalCount)}
        </div>
        <Button
          aria-disabled={page >= pageCount}
          aria-label="Next page"
          onClick={() => {
            if (page < pageCount) {
              onPage(page + 1);
            }
          }}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronRight
            aria-hidden="true"
            className={PAGING_DISABLED_ICON}
          />
        </Button>
      </ButtonGroup>
    </div>
  );
}
