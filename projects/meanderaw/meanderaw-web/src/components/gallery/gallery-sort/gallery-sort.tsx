import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { createElement, useMemo } from "react";

import { Button, ButtonGroup } from "@codebase/presentation";

import { MAXIMUM_SORTS } from "../../../hooks/use-gallery-search/use-gallery-search.constants";
import { GallerySegment } from "../gallery-cascader/components/gallery-segment/gallery-segment";
import { SEGMENT_CLASS } from "../gallery-cascader/components/gallery-segment/gallery-segment.constants";
import { moveItem } from "../gallery-cascader/components/gallery-segment/gallery-segment.utilities";
import { GalleryCascader } from "../gallery-cascader/gallery-cascader";
import { createFieldNodes } from "../gallery-cascader/gallery-cascader.utilities";
import { GallerySurface } from "../gallery-surface/gallery-surface";

import { DIRECTION_ARROWS } from "./gallery-sort.constants";
import { createSortFields } from "./gallery-sort.utilities";

import type { SortEntry } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The sort fields, the sorts in force, and how to change them.
 */
export interface GallerySortProperties {
  /** The catalog, whose keys join the shape fields as fields to sort by. */
  characteristics: readonly GalleryCharacteristic[];
  className?: string;
  onSortsChange: (sorts: SortEntry[]) => void;
  /** The fields sorted by, first to last, each with its direction. */
  sorts: readonly SortEntry[];
}

// 🧩 Component

/**
 * Renders the Sort button, whose cascader ticks fields into sorts, and a segment with a menu for each.
 */
export function GallerySort(
  properties: Readonly<GallerySortProperties>,
): ReactNode {
  const { characteristics, className, onSortsChange, sorts } = properties;

  // 🪝 Hooks
  const fields = useMemo(
    () => createSortFields(characteristics),
    [characteristics],
  );
  const items = useMemo(() => createFieldNodes(fields), [fields]);

  // 🏗 Setup
  const labelOf = (key: string): string =>
    fields.find((field) => field.key === key)?.label ?? key;

  // 💪 Handlers
  // Ticking adds a field, ascending, at the end, up to the most.
  const handleToggle = (key: string): void => {
    if (sorts.some(({ field }) => field === key)) {
      onSortsChange(sorts.filter(({ field }) => field !== key));
    } else {
      onSortsChange(
        [...sorts, { direction: "asc" as const, field: key }].slice(
          0,
          MAXIMUM_SORTS,
        ),
      );
    }
  };

  const handleReverse = (index: number): void => {
    onSortsChange(
      sorts.map((entry, position) =>
        position === index
          ? { ...entry, direction: entry.direction === "asc" ? "desc" : "asc" }
          : entry,
      ),
    );
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
            checked={sorts.map(({ field }) => field)}
            items={items}
            label="Sort by"
            max={MAXIMUM_SORTS}
            onToggle={handleToggle}
          />
        </GallerySurface>
        {sorts.map(({ direction, field }, index) => (
          <GallerySegment
            key={field}
            actions={[
              {
                icon: ArrowLeft,
                isDisabled: index === 0,
                label: "Move left",
                onSelect: () => {
                  onSortsChange(moveItem(sorts, index, -1));
                },
              },
              {
                icon: ArrowRight,
                isDisabled: index === sorts.length - 1,
                label: "Move right",
                onSelect: () => {
                  onSortsChange(moveItem(sorts, index, 1));
                },
              },
              {
                icon: ArrowDownUp,
                label: "Reverse",
                onSelect: () => {
                  handleReverse(index);
                },
              },
              {
                icon: Trash2,
                isDestructive: true,
                label: "Remove",
                onSelect: () => {
                  handleToggle(field);
                },
              },
            ]}
            ariaLabel={`Sorted by ${labelOf(field)}, ${direction === "asc" ? "ascending" : "descending"}`}
            className={SEGMENT_CLASS}
            label={
              <>
                {labelOf(field)}
                {createElement(DIRECTION_ARROWS[direction], {
                  "aria-hidden": true,
                })}
              </>
            }
            menuLabel={`${labelOf(field)} sorting options`}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
