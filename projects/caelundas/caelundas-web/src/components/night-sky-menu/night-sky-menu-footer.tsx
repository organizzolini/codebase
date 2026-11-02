import { Button } from "@codebase/presentation";

import { toFullViewChange, toResetChange } from "./night-sky-menu.utilities";

import type { SkySearchChange } from "./night-sky-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Where the footer's buttons send their change to the link.
 */
export interface NightSkyMenuFooterProperties {
  className?: string;
  onChange: (change: SkySearchChange) => void;
}

// 🧩 Component

/**
 * Renders the Sky menu's footer: Full, which shows the pole's whole sky, and
 * Default, which removes every setting the menu holds but the tuning view.
 */
export function NightSkyMenuFooter(
  properties: Readonly<NightSkyMenuFooterProperties>,
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
      data-testid="night-sky-menu-footer"
    >
      <Button
        onClick={() => {
          onChange(toFullViewChange());
        }}
        size="sm"
        variant="outline"
      >
        Full
      </Button>
      <Button
        onClick={() => {
          onChange(toResetChange());
        }}
        size="sm"
      >
        Default
      </Button>
    </div>
  );
}
