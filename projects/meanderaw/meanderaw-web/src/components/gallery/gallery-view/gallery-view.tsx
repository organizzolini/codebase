import { Eye } from "lucide-react";

import { Button, ButtonGroup, ButtonGroupText } from "@codebase/presentation";

import { GalleryCascader } from "../gallery-cascader/gallery-cascader";
import { GallerySurface } from "../gallery-surface/gallery-surface";

import { VIEW_PRESETS } from "./gallery-view.constants";
import {
  createViewNodes,
  describeView,
  isPresetActive,
} from "./gallery-view.utilities";

import type { ViewState } from "./gallery-view.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The state in force, and what to call to apply a view.
 */
export interface GalleryViewProperties {
  className?: string;
  current: ViewState;
  onApply: (state: Partial<ViewState>) => void;
}

// 🧩 Component

/**
 * Renders the View button, whose cascader lists Layout and Presets with checks, beside the name of the view in force.
 */
export function GalleryView(
  properties: Readonly<GalleryViewProperties>,
): ReactNode {
  const { className, current, onApply } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const items = createViewNodes(VIEW_PRESETS);

  // 💪 Handlers
  // Pressing a view applies it, whether or not it is already in force.
  const handleToggle = (id: string): void => {
    for (const preset of VIEW_PRESETS) {
      if (preset.id === id) {
        onApply(preset.state);
      }
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-view"
    >
      <ButtonGroup aria-label="View">
        <GallerySurface
          contentClassName="w-80 p-1"
          title="View"
          trigger={
            <Button
              className="in-data-[slot=button-group]:rounded-r-none"
              size="sm"
              variant="outline"
            >
              <Eye aria-hidden="true" />
              View
            </Button>
          }
        >
          <GalleryCascader
            checked={VIEW_PRESETS.filter((preset) =>
              isPresetActive(preset, current),
            ).map(({ id }) => id)}
            items={items}
            label="Search views"
            onToggle={handleToggle}
          />
        </GallerySurface>
        <ButtonGroupText className="border-border bg-background h-7 text-[0.8rem] dark:border-input dark:bg-input/30">
          {describeView(VIEW_PRESETS, current)}
        </ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}
