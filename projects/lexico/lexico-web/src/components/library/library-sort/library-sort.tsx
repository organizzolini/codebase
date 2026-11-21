import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";

import { LibrarySortDirection } from "../../../graphql/generated/operations";
import { LibraryChip } from "../../library-strip/library-chip/library-chip";
import { LibraryOptionMenu } from "../library-toolbar/library-option-menu";

import {
  LIBRARY_SORT_FIELDS,
  LIBRARY_SORT_MENU_OPTIONS,
} from "./library-sort.constants";
import {
  describeSort,
  flipSort,
  reorderSorts,
  toggleSort,
} from "./library-sort.utilities";

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
 * The Sort button with its searchable checklist of attributes, joined to a draggable chip for each active sort in the order they apply. A chip's label flips its direction, dragging it reorders the sorts, and its cross removes it; checking an attribute adds it last.
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
        onReorder={(values) => {
          onSorts(reorderSorts(sorts, values));
        }}
        onToggle={(value) => {
          const field = LIBRARY_SORT_FIELDS.get(value);
          if (field !== undefined) {
            handleToggle(field);
          }
        }}
        options={LIBRARY_SORT_MENU_OPTIONS}
        selected={sorts.map(({ field }) => field)}
        title="Sort by"
      >
        {sorts.map(({ direction, field }) => {
          const { icon, label } = describeSort(field);
          const isDescending = direction === LibrarySortDirection.Desc;
          const DirectionIcon = isDescending ? ArrowDown : ArrowUp;

          return (
            <LibraryChip
              key={field}
              activateLabel={`Sort by ${label}, ${isDescending ? "descending" : "ascending"}. Switch to ${isDescending ? "ascending" : "descending"}`}
              icon={icon}
              label={label}
              onActivate={() => {
                handleFlip(field);
              }}
              onRemove={() => {
                handleToggle(field);
              }}
              removeLabel={`Remove sort by ${label}`}
              trailing={<DirectionIcon aria-hidden="true" />}
              value={field}
            />
          );
        })}
      </LibraryOptionMenu>
    </div>
  );
}
