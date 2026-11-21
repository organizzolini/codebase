import { Eye } from "lucide-react";
import { useState } from "react";

import { Button, ButtonGroup } from "@codebase/presentation";

import { GalleryCascader } from "../gallery-cascader/gallery-cascader";
import { GallerySurface } from "../gallery-surface/gallery-surface";

import { DisplayStrip } from "./components/display-strip/display-strip";
import {
  createViewNodes,
  createViewPresets,
  describeView,
  isPresetActive,
} from "./gallery-view.utilities";

import type { ViewState } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryCharacteristic } from "../meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The state, the catalog, and the apply handler.
 */
export interface GalleryViewProperties {
  /** The catalog, which decides the presets on offer. */
  characteristics: readonly GalleryCharacteristic[];
  className?: string;
  current: ViewState;
  onApply: (state: Partial<ViewState>) => void;
}

// 🧩 Component

/**
 * Renders the View strip, whose cascader lists named presets, and the Display strip beside it, which sets the layout.
 */
export function GalleryView(
  properties: Readonly<GalleryViewProperties>,
): ReactNode {
  const { characteristics, className, current, onApply } = properties;

  // 🪝 Hooks
  const [open, setOpen] = useState(false);

  // 🏗 Setup
  const presets = createViewPresets(characteristics);

  // 💪 Handlers
  // Pressing a preset applies all of it, whether or not it is in force.
  const handleToggle = (id: string): void => {
    for (const preset of presets) {
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
          contentClassName="w-auto min-w-64 gap-0 p-0"
          onOpenChange={setOpen}
          open={open}
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
            checked={presets
              .filter((preset) => isPresetActive(preset, current))
              .map(({ id }) => id)}
            items={createViewNodes(presets)}
            label="Search views"
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
          {describeView(presets, current)}
        </Button>
      </ButtonGroup>
      <DisplayStrip
        onViewChange={(view) => {
          onApply({ view });
        }}
        view={current.view}
      />
    </div>
  );
}
