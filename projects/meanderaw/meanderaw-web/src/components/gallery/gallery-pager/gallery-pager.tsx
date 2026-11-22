import { ChevronLeft, ChevronRight, Rows3 } from "lucide-react";

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { PageList } from "./components/page-list/page-list";
import { PageSizes } from "./components/page-sizes/page-sizes";
import { RANGE_SEGMENT } from "./gallery-pager.constants";
import { describeRange } from "./gallery-pager.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The pages showing, how many there are, and the paging handlers.
 */
export interface GalleryPagerProperties {
  className?: string;
  /** The first page showing, from 1. */
  first: number;
  /** The last page showing, from 1. */
  last: number;
  /** Shows one page alone, from 1. */
  onPage: (page: number) => void;
  onSizeChange: (size: number) => void;
  /** How many pages the meanders fill. */
  pageCount: number;
  /** How many meanders a full page holds. */
  size: number;
  total: number;
}

// 🧩 Component

/**
 * Renders the Page button, whose menu sets the size and goes to a page, joined to chevrons around the range.
 */
export function GalleryPager(
  properties: Readonly<GalleryPagerProperties>,
): ReactNode {
  const {
    className,
    first,
    last,
    onPage,
    onSizeChange,
    pageCount,
    size,
    total,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-pager"
    >
      <ButtonGroup aria-label="Pages">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              />
            }
          >
            <Rows3 aria-hidden="true" />
            Page
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <PageSizes
              onSizeChange={onSizeChange}
              size={size}
            />
            <DropdownMenuSeparator />
            <PageList
              first={first}
              last={last}
              onPage={onPage}
              pageCount={pageCount}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          aria-label="Previous page"
          className="aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground"
          disabled={first <= 1}
          onClick={() => {
            onPage(first - 1);
          }}
          size="icon-sm"
          variant="outline"
          focusableWhenDisabled
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <div
          aria-live="polite"
          className={RANGE_SEGMENT}
          data-slot="button"
        >
          {describeRange({ first, last, size, total })}
        </div>
        <Button
          aria-label="Next page"
          className="aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground"
          disabled={last >= pageCount}
          onClick={() => {
            onPage(last + 1);
          }}
          size="icon-sm"
          variant="outline"
          focusableWhenDisabled
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
