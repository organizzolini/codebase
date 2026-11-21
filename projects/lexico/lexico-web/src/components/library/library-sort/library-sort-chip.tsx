import { ArrowDown, ArrowUp, X } from "lucide-react";
import { createElement } from "react";

import { Button, ButtonGroup, ButtonGroupText } from "@codebase/presentation";

import { LibrarySortDirection } from "../../../graphql/generated/operations";

import { describeSort } from "./library-sort.utilities";

import type { LibrarySortField } from "../../../graphql/generated/operations";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibrarySortChip component.
 */
export interface LibrarySortChipProperties {
  className?: string;
  direction?: LibrarySortDirection | undefined;
  onSort: (sort?: LibrarySortField, direction?: LibrarySortDirection) => void;
  sort: LibrarySortField;
}

// 🧩 Component

/**
 * The chip for the active sort: its attribute, a direction toggle, and a remove button, in the look of a filter chip.
 */
export function LibrarySortChip(
  properties: Readonly<LibrarySortChipProperties>,
): ReactNode {
  const {
    className,
    direction = LibrarySortDirection.Asc,
    onSort,
    sort,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { icon: AttributeIcon, label } = describeSort(sort);
  const isDescending = direction === LibrarySortDirection.Desc;
  const Icon = isDescending ? ArrowDown : ArrowUp;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-sort-chip"
    >
      <ButtonGroup
        aria-label={`Sort by ${label}, ${isDescending ? "descending" : "ascending"}`}
      >
        <ButtonGroupText className="cursor-default bg-background dark:bg-input/30">
          {AttributeIcon === undefined
            ? null
            : createElement(AttributeIcon, {
                "aria-hidden": true,
                className: "text-muted-foreground",
              })}
          Sort: {label}
        </ButtonGroupText>
        <Button
          aria-label={`Direction: ${isDescending ? "descending" : "ascending"}. Switch to ${isDescending ? "ascending" : "descending"}`}
          className="bg-background text-muted-foreground dark:bg-input/30"
          onClick={() => {
            onSort(
              sort,
              isDescending
                ? LibrarySortDirection.Asc
                : LibrarySortDirection.Desc,
            );
          }}
          type="button"
          variant="outline"
        >
          <Icon aria-hidden="true" />
          {isDescending ? "Descending" : "Ascending"}
        </Button>
        <Button
          aria-label="Remove sort"
          className="bg-background dark:bg-input/30"
          onClick={() => {
            onSort();
          }}
          size="icon"
          type="button"
          variant="outline"
        >
          <X aria-hidden="true" />
        </Button>
      </ButtonGroup>
    </div>
  );
}
