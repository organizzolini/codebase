import { ChevronLeft, ChevronRight, Rows3 } from "lucide-react";

import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { PageMenu } from "./components/page-menu/page-menu";
import { describeRange } from "./gallery-pager.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The page showing, how many there are, and the paging handlers.
 */
export interface GalleryPagerProperties {
  className?: string;
  isLoading: boolean;
  onPage: (position: number) => void;
  onSizeChange: (size: number) => void;
  /** How many pages the meanders fill. */
  pageCount: number;
  /** The place of the page showing, from 0. */
  position: number;
  /** How many meanders the page showing holds. */
  shown: number;
  /** How many meanders a full page holds. */
  size: number;
  total: number;
}

// 🧩 Component

/**
 * Renders the Page button, whose popover sets the size and goes to a page, joined to chevrons around the range.
 */
export function GalleryPager(
  properties: Readonly<GalleryPagerProperties>,
): ReactNode {
  const {
    className,
    isLoading,
    onPage,
    onSizeChange,
    pageCount,
    position,
    shown,
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
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              />
            }
          >
            <Rows3 aria-hidden="true" />
            Page
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-64 gap-3"
          >
            <PageMenu
              onPage={onPage}
              onSizeChange={onSizeChange}
              pageCount={pageCount}
              size={size}
            />
          </PopoverContent>
        </Popover>
        <Button
          aria-label="Previous page"
          disabled={position <= 0 || isLoading}
          onClick={() => {
            onPage(position - 1);
          }}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <ButtonGroupText
          aria-live="polite"
          className="border-border bg-background h-7 text-[0.8rem] tabular-nums dark:border-input dark:bg-input/30"
        >
          {isLoading
            ? "Loading…"
            : describeRange({ position, shown, size, total })}
        </ButtonGroupText>
        <Button
          aria-label="Next page"
          disabled={position + 1 >= pageCount || isLoading}
          onClick={() => {
            onPage(position + 1);
          }}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
