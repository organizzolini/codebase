import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo } from "react";

import { Button, ButtonGroup } from "@codebase/presentation";

import { GalleryCascader } from "../gallery-cascader/gallery-cascader";
import { createFieldNodes } from "../gallery-cascader/gallery-cascader.utilities";
import { GallerySurface } from "../gallery-surface/gallery-surface";

import { createSortFields } from "./gallery-sort.utilities";

import type { SortDirection } from "../../../hooks/use-gallery-search/use-gallery-search.types";
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
  /** The field sorted by. */
  field: string;
  onSortChange: (field: string | undefined, direction: SortDirection) => void;
}

// 🧩 Component

/**
 * Renders the Sort button, whose cascader picks the field, and the field with an arrow that flips the direction.
 */
export function GallerySort(
  properties: Readonly<GallerySortProperties>,
): ReactNode {
  const { characteristics, className, direction, field, onSortChange } =
    properties;

  // 🪝 Hooks
  const fields = useMemo(
    () => createSortFields(characteristics),
    [characteristics],
  );
  const items = useMemo(() => createFieldNodes(fields), [fields]);

  // 🏗 Setup
  const current = fields.find(({ key }) => key === field);

  // 💪 Handlers
  // Pressing the field sorted by goes back to the default sort, rows.
  const handleToggle = (key: string): void => {
    onSortChange(key === field ? undefined : key, direction);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-sort"
    >
      <ButtonGroup aria-label="Sort">
        <GallerySurface
          contentClassName="w-auto min-w-64 gap-0 p-0"
          title="Sort"
          trigger={
            <Button
              className="in-data-[slot=button-group]:rounded-r-none"
              size="sm"
              variant="outline"
            >
              <ArrowUpDown aria-hidden="true" />
              Sort
            </Button>
          }
        >
          <GalleryCascader
            checked={[field]}
            items={items}
            label="Sort by"
            onToggle={handleToggle}
          />
        </GallerySurface>
        <Button
          aria-label={
            direction === "asc" ? "Sort descending" : "Sort ascending"
          }
          onClick={() => {
            onSortChange(field, direction === "asc" ? "desc" : "asc");
          }}
          size="sm"
          variant="outline"
        >
          {current?.label ?? field}
          {direction === "asc" ? (
            <ArrowUp aria-hidden="true" />
          ) : (
            <ArrowDown aria-hidden="true" />
          )}
        </Button>
      </ButtonGroup>
    </div>
  );
}
