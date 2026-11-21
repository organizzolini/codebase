import { ArrowLeft, ArrowRight, Layers, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { Button, ButtonGroup } from "@codebase/presentation";

import { GallerySegment } from "../gallery-cascader/components/gallery-segment/gallery-segment";
import { SEGMENT_CLASS } from "../gallery-cascader/components/gallery-segment/gallery-segment.constants";
import { moveItem } from "../gallery-cascader/components/gallery-segment/gallery-segment.utilities";
import { GalleryCascader } from "../gallery-cascader/gallery-cascader";
import { createFieldNodes } from "../gallery-cascader/gallery-cascader.utilities";
import { GallerySurface } from "../gallery-surface/gallery-surface";

import {
  GROUP_TITLE,
  MAXIMUM_GROUP_LEVELS,
} from "./gallery-group-by.constants";

import type { GroupField } from "./gallery-group-by.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields, the grouping in force, and how to change it.
 */
export interface GalleryGroupByProperties {
  className?: string;
  fields: readonly GroupField[];
  /** The field of each level, outermost first. */
  grouping: readonly string[];
  onGroupingChange: (grouping: string[]) => void;
}

// 🧩 Component

/**
 * Renders the Group button, whose cascader ticks fields into levels, and a button beside it for each level.
 */
export function GalleryGroupBy(
  properties: Readonly<GalleryGroupByProperties>,
): ReactNode {
  const { className, fields, grouping, onGroupingChange } = properties;

  // 🪝 Hooks
  const items = useMemo(() => createFieldNodes(fields), [fields]);

  // 🏗 Setup

  const labelOf = (key: string): string =>
    fields.find((field) => field.key === key)?.label ?? key;

  // 💪 Handlers
  // Ticking adds a level at the end, up to the most; clearing removes it.
  const handleToggle = (key: string): void => {
    if (grouping.includes(key)) {
      onGroupingChange(grouping.filter((level) => level !== key));
    } else {
      onGroupingChange([...grouping, key].slice(0, MAXIMUM_GROUP_LEVELS));
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-group-by"
    >
      <ButtonGroup aria-label={GROUP_TITLE}>
        <GallerySurface
          contentClassName="w-auto min-w-64 gap-0 p-0"
          title={GROUP_TITLE}
          trigger={
            <Button
              className="in-data-[slot=button-group]:rounded-r-none"
              size="sm"
              variant="outline"
            >
              <Layers aria-hidden="true" />
              {GROUP_TITLE}
            </Button>
          }
        >
          <GalleryCascader
            checked={grouping}
            items={items}
            label="Group by"
            max={MAXIMUM_GROUP_LEVELS}
            onToggle={handleToggle}
          />
        </GallerySurface>
        {grouping.map((key, index) => (
          <GallerySegment
            key={key}
            actions={[
              {
                icon: ArrowLeft,
                isDisabled: index === 0,
                label: "Move left",
                onSelect: () => {
                  onGroupingChange(moveItem(grouping, index, -1));
                },
              },
              {
                icon: ArrowRight,
                isDisabled: index === grouping.length - 1,
                label: "Move right",
                onSelect: () => {
                  onGroupingChange(moveItem(grouping, index, 1));
                },
              },
              {
                icon: Trash2,
                isDestructive: true,
                label: "Remove",
                onSelect: () => {
                  handleToggle(key);
                },
              },
            ]}
            ariaLabel={`Grouped by ${labelOf(key)}`}
            className={SEGMENT_CLASS}
            label={labelOf(key)}
            menuLabel={`${labelOf(key)} grouping options`}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
