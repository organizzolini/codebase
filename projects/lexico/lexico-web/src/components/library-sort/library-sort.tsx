import { ArrowDownUp } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { LibrarySortDirection } from "../../graphql/generated/operations";

import {
  LIBRARY_SORT_FIELDS,
  LIBRARY_SORT_OPTIONS,
} from "./library-sort.constants";

import type { LibrarySortField } from "../../graphql/generated/operations";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibrarySort component.
 */
export interface LibrarySortProperties {
  className?: string;
  direction?: LibrarySortDirection | undefined;
  onSort: (sort?: LibrarySortField, direction?: LibrarySortDirection) => void;
  sort?: LibrarySortField | undefined;
}

// 🧩 Component

/**
 * The Sort button and its menu of attributes. The API orders by one attribute, so choosing another replaces it, keeping the direction.
 */
export function LibrarySort(
  properties: Readonly<LibrarySortProperties>,
): ReactNode {
  const { className, direction, onSort, sort } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleChange = (value: string): void => {
    onSort(
      LIBRARY_SORT_FIELDS.get(value),
      direction ?? LibrarySortDirection.Asc,
    );
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-sort"
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
          <ArrowDownUp aria-hidden="true" />
          Sort
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-96 w-72"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              onValueChange={handleChange}
              value={sort ?? ""}
            >
              {LIBRARY_SORT_OPTIONS.map(({ field, icon: Icon, label }) => (
                <DropdownMenuRadioItem
                  key={field}
                  className="gap-2"
                  value={field}
                >
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground"
                  />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
