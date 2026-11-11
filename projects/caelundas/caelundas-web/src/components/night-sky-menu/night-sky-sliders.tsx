import { NightSkySlider } from "./night-sky-slider";

import type { NightSkyOverrides } from "../../hooks/use-night-sky/use-night-sky.types";
import type { SkyParameterKey, SkySliderControl } from "./night-sky-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * One section's sliders, settings, and change handler.
 */
export interface NightSkySlidersProperties {
  className?: string;
  controls: readonly SkySliderControl[];
  onValueChange: (key: SkyParameterKey, value: number) => void;
  settings: NightSkyOverrides;
}

// 🧩 Component

/**
 * Renders one section's sliders in order, each showing its setting.
 */
export function NightSkySliders(
  properties: Readonly<NightSkySlidersProperties>,
): ReactNode {
  const { className, controls, onValueChange, settings } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-sliders"
    >
      {controls.map((control) => (
        <NightSkySlider
          key={control.key}
          control={control}
          onValueChange={onValueChange}
          value={settings[control.field]}
        />
      ))}
    </div>
  );
}
