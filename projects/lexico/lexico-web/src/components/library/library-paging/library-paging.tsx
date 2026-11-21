import { Rows3 } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { LIBRARY_LIMITS } from "../library-grid/library-grid-api.constants";

import { PAGING_LABEL } from "./library-paging.constants";
import { listPages } from "./library-paging.utilities";

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
}

// 🧩 Component

/**
 * The Page button and its menu: the authors per page, then the page to show.
 */
export function LibraryPaging(
  properties: Readonly<LibraryPagingProperties>,
): ReactNode {
  const { className, limit, onLimit, onPage, page, pageCount } = properties;

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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className="bg-card hover:bg-muted dark:bg-card dark:hover:bg-muted"
              type="button"
              variant="outline"
            />
          }
        >
          <Rows3 aria-hidden="true" />
          {PAGING_LABEL}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-96 w-48"
        >
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
    </div>
  );
}
