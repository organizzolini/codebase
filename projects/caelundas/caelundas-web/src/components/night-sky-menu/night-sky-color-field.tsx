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
 * Renders one of the night sky's colors as a labeled color input, the
 * browser's own picker, which every platform makes touch and keyboard ready.
 */
export function NightSkyColorField(
  properties: Readonly<NightSkyColorFieldProperties>,
): ReactNode {
  const { className, control, onValueChange, value } = properties;

  // 🪝 Hooks

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
      <label className="flex items-center justify-between gap-2 text-xs">
        {control.label}
        <input
          className="border-input h-8 w-12 cursor-pointer rounded-md border bg-transparent p-0.5"
          onChange={(event) => {
            onValueChange(control.key, event.target.value);
          }}
          type="color"
          value={value}
        />
      </label>
    </div>
  );
}
