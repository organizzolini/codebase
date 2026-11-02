import { Button } from "@codebase/presentation";

import {
  PRESET_FIRST_CLASS_NAME,
  PRESET_LAST_CLASS_NAME,
} from "./night-sky-menu.constants";
import { toFullViewChange, toResetChange } from "./night-sky-menu.utilities";

import type { SkySearchChange } from "./night-sky-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Where the presets send their change to the link.
 */
export interface NightSkyPresetsProperties {
  className?: string;
  onChange: (change: SkySearchChange) => void;
}

// 🧩 Component

/**
 * Renders the Sky menu's presets as one pill of two joined buttons: Full,
 * which shows the pole's whole sky above the horizon, slowly, and Default,
 * which removes every setting the menu holds but the tuning view.
 */
export function NightSkyPresets(
  properties: Readonly<NightSkyPresetsProperties>,
): ReactNode {
  const { className, onChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-presets"
    >
      <div
        aria-label="Sky presets"
        className="flex"
        role="group"
      >
        <Button
          className={PRESET_FIRST_CLASS_NAME}
          onClick={() => {
            onChange(toFullViewChange());
          }}
          size="xs"
          variant="outline"
        >
          Full
        </Button>
        <Button
          className={PRESET_LAST_CLASS_NAME}
          onClick={() => {
            onChange(toResetChange());
          }}
          size="xs"
          variant="outline"
        >
          Default
        </Button>
      </div>
    </div>
  );
}
