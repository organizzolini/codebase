import { ArrowDown, ArrowDownUp, ArrowUp, X } from "lucide-react";
import { createElement, Fragment } from "react";

import { Button } from "@codebase/presentation";

import { LibrarySortDirection } from "../../../graphql/generated/operations";
import { LibraryOptionMenu } from "../library-toolbar/library-option-menu";

import {
  LIBRARY_SORT_FIELDS,
  LIBRARY_SORT_MENU_OPTIONS,
} from "./library-sort.constants";
import { describeSort, flipSort, toggleSort } from "./library-sort.utilities";

import type { LibrarySortField } from "../../../graphql/generated/operations";
import type { LibrarySortEntry } from "./library-sort.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibrarySort component.
 */
export interface LibrarySortProperties {
  className?: string;
  onSorts: (sorts: LibrarySortEntry[]) => void;
  /** The active sorts, first being the primary key. */
  sorts?: readonly LibrarySortEntry[] | undefined;
}

// 🧩 Component

/**
 * The Sort button with its searchable checklist of attributes, joined to a chip for each active sort in the order they apply. A chip's first button flips its direction and its cross removes it; checking an attribute adds it last.
 */
export function LibrarySort(
  properties: Readonly<LibrarySortProperties>,
): ReactNode {
  const { className, onSorts, sorts = [] } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleFlip = (field: LibrarySortField): void => {
    onSorts(flipSort(sorts, field));
  };
  const handleToggle = (field: LibrarySortField): void => {
    onSorts(toggleSort(sorts, field));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-sort"
    >
      <LibraryOptionMenu
        icon={ArrowDownUp}
        label="Sort"
        onToggle={(value) => {
          const field = LIBRARY_SORT_FIELDS.get(value);
          if (field !== undefined) {
            handleToggle(field);
          }
        }}
        options={LIBRARY_SORT_MENU_OPTIONS}
        selected={new Set(sorts.map(({ field }) => field))}
        title="Sort by"
      >
        {sorts.map(({ direction, field }) => {
          const { icon: AttributeIcon, label } = describeSort(field);
          const isDescending = direction === LibrarySortDirection.Desc;
          const DirectionIcon = isDescending ? ArrowDown : ArrowUp;

          return (
            <Fragment key={field}>
              <Button
                aria-label={`Sort by ${label}, ${isDescending ? "descending" : "ascending"}. Switch to ${isDescending ? "ascending" : "descending"}`}
                data-testid="library-sort-chip"
                onClick={() => {
                  handleFlip(field);
                }}
                type="button"
                variant="outline"
              >
                {AttributeIcon === undefined
                  ? null
                  : createElement(AttributeIcon, { "aria-hidden": true })}
                {label}
                <DirectionIcon aria-hidden="true" />
              </Button>
              <Button
                aria-label={`Remove sort by ${label}`}
                onClick={() => {
                  handleToggle(field);
                }}
                size="icon"
                type="button"
                variant="outline"
              >
                <X aria-hidden="true" />
              </Button>
            </Fragment>
          );
        })}
      </LibraryOptionMenu>
    </div>
  );
}
