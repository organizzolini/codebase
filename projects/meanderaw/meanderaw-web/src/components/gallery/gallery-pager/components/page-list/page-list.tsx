import { useVirtualizer } from "@tanstack/react-virtual";
import { useState } from "react";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@codebase/presentation";

import { PAGE_ITEM_HEIGHT, PAGE_OVERSCAN } from "./page-list.constants";
import { startOffset } from "./page-list.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The pages showing, the page count, and how to go to one.
 */
export interface PageListProperties {
  /** The first page showing, from 1. */
  first: number;
  /** The last page showing, from 1. */
  last: number;
  onPage: (page: number) => void;
  pageCount: number;
}

// 🧩 Component

/**
 * Renders the menu's list of every page, mounting only those in view, a check on each showing.
 */
export function PageList(properties: Readonly<PageListProperties>): ReactNode {
  const { first, last, onPage, pageCount } = properties;

  // 🪝 Hooks
  const [element, setElement] = useState<HTMLElement | null>(null);
  const virtualizer = useVirtualizer({
    count: pageCount,
    estimateSize: () => PAGE_ITEM_HEIGHT,
    getScrollElement: () => element,
    initialOffset: startOffset(first),
    overscan: PAGE_OVERSCAN,
  });

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Go to page</DropdownMenuLabel>
      <div
        ref={setElement}
        className="max-h-56 overflow-y-auto"
        data-testid="page-list"
      >
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map(({ index, key, start }) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={index + 1 >= first && index + 1 <= last}
              className="absolute left-0 w-full"
              onCheckedChange={() => {
                onPage(index + 1);
              }}
              style={{ height: PAGE_ITEM_HEIGHT, top: start }}
            >
              {`Page ${(index + 1).toLocaleString("en-US")}`}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </div>
    </DropdownMenuGroup>
  );
}
