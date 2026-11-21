import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button, ButtonGroup } from "@codebase/presentation";

import { GALLERY_VIEWS } from "../../../../../hooks/use-gallery-search/use-gallery-search.constants";
import { GalleryCascader } from "../../../gallery-cascader/gallery-cascader";
import { GallerySurface } from "../../../gallery-surface/gallery-surface";

import { LAYOUT_NAMES, LAYOUT_NODES } from "./display-strip.constants";

import type { GalleryView } from "../../../../../hooks/use-gallery-search/use-gallery-search.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The layout in force, and what to call to pick another.
 */
export interface DisplayStripProperties {
  className?: string;
  onViewChange: (view: GalleryView) => void;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the Display strip: a button and the layout in force, either opening a cascader of layouts.
 */
export function DisplayStrip(
  properties: Readonly<DisplayStripProperties>,
): ReactNode {
  const { className, onViewChange, view } = properties;

  // 🪝 Hooks
  const [open, setOpen] = useState(false);

  // 🏗 Setup

  // 💪 Handlers
  const handleToggle = (value: string): void => {
    for (const option of GALLERY_VIEWS) {
      if (option === value) {
        onViewChange(option);
      }
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="display-strip"
    >
      <ButtonGroup aria-label="Display">
        <GallerySurface
          contentClassName="w-auto min-w-64 gap-0 p-0"
          onOpenChange={setOpen}
          open={open}
          title="Display"
          trigger={
            <Button
              className="in-data-[slot=button-group]:rounded-r-none"
              size="sm"
              variant="outline"
            >
              <SlidersHorizontal aria-hidden="true" />
              Display
            </Button>
          }
        >
          <GalleryCascader
            checked={[view]}
            items={LAYOUT_NODES}
            label="Search layouts"
            onToggle={handleToggle}
          />
        </GallerySurface>
        <Button
          onClick={() => {
            setOpen(!open);
          }}
          size="sm"
          variant="outline"
        >
          {LAYOUT_NAMES[view]}
        </Button>
      </ButtonGroup>
    </div>
  );
}
