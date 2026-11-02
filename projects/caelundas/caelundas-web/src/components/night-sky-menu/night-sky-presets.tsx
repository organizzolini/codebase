import { Button, ButtonGroup } from "@codebase/presentation";

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
 * Renders the Sky menu's presets as one button group: Full,
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
      <ButtonGroup aria-label="Sky presets">
        <Button
          onClick={() => {
            onChange(toFullViewChange());
          }}
          size="xs"
          variant="outline"
        >
          Full
        </Button>
        <Button
          onClick={() => {
            onChange(toResetChange());
          }}
          size="xs"
          variant="outline"
        >
          Default
        </Button>
      </ButtonGroup>
    </div>
  );
}
