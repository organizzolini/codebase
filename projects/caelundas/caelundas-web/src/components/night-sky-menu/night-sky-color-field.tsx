import { useId } from "react";

import { ColorPicker } from "@codebase/presentation";

import type { SkyColorControl, SkyParameterKey } from "./night-sky-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The color a field picks, its value as `#rrggbb`, and where to send a picked
 * one.
 */
export interface NightSkyColorFieldProperties {
  className?: string;
  control: SkyColorControl;
  onValueChange: (key: SkyParameterKey, value: string) => void;
  value: string;
}

// 🧩 Component

/**
 * Renders one night sky color as a labeled ReUI color picker, written to the link as `#rrggbb` as it moves.
 */
export function NightSkyColorField(
  properties: Readonly<NightSkyColorFieldProperties>,
): ReactNode {
  const { className, control, onValueChange, value } = properties;

  // 🪝 Hooks
  const labelId = useId();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-color-field"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span id={labelId}>{control.label}</span>
        <ColorPicker
          aria-labelledby={labelId}
          className="h-8 w-32 text-xs"
          onValueChange={(next: null | string) => {
            if (next !== null) {
              onValueChange(control.key, next);
            }
          }}
          value={value}
        />
      </div>
    </div>
  );
}
