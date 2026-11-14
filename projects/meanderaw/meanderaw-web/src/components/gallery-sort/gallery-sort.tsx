import {
  DEFAULT_ORDER_LABEL,
  SHAPE_SORT_FIELDS,
} from "./gallery-sort.constants";

import type { SortDirection } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The sort fields, the sort in force, and how to change it.
 */
export interface GallerySortProperties {
  /** The catalog, whose keys join the shape fields as fields to sort by. */
  characteristics: readonly GalleryCharacteristic[];
  className?: string;
  direction: SortDirection;
  /** The field sorted by, or none for the default order. */
  field: string | undefined;
  onSortChange: (field: string | undefined, direction: SortDirection) => void;
}

// 🧩 Component

/**
 * Renders the sort control: a field picker over the shape fields and the
 * catalog, and a button that flips the direction.
 */
export function GallerySort(
  properties: Readonly<GallerySortProperties>,
): ReactNode {
  const { characteristics, className, direction, field, onSortChange } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleFieldChange = (value: string): void => {
    onSortChange(value === "" ? undefined : value, direction);
  };
  const handleDirectionToggle = (): void => {
    onSortChange(field, direction === "asc" ? "desc" : "asc");
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-sort"
    >
      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          Sort by
          <select
            className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
            onChange={(event) => {
              handleFieldChange(event.target.value);
            }}
            value={field ?? ""}
          >
            <option value="">{DEFAULT_ORDER_LABEL}</option>
            <optgroup label="Shape">
              {SHAPE_SORT_FIELDS.map(({ key, label }) => (
                <option
                  key={key}
                  value={key}
                >
                  {label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Characteristics">
              {characteristics.map(({ key, name }) => (
                <option
                  key={key}
                  value={key}
                >
                  {name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <button
          aria-label={
            direction === "asc" ? "Sort descending" : "Sort ascending"
          }
          className="rounded-md border border-(--line) px-3 py-1 disabled:opacity-50"
          disabled={field === undefined}
          onClick={handleDirectionToggle}
          type="button"
        >
          {direction === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>
    </div>
  );
}
