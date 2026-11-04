import { useId } from "react";

import { Label, Slider } from "@codebase/presentation";

import { SLIDER_CLASS_NAME } from "./night-sky-menu.constants";
import { formatSliderValue, readSliderValue } from "./night-sky-menu.utilities";

import type { SkyParameterKey, SkySliderControl } from "./night-sky-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The number a slider sets, its value, and where to send a moved one.
 */
export interface NightSkySliderProperties {
  className?: string;
  control: SkySliderControl;
  onValueChange: (key: SkyParameterKey, value: number) => void;
  value: number;
}

// 🧩 Component

/**
 * Renders one of the night sky's numbers as a labeled slider showing its
 * value and unit. It sends every step as it moves, so the sky follows it.
 */
export function NightSkySlider(
  properties: Readonly<NightSkySliderProperties>,
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
      data-testid="night-sky-slider"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <Label id={labelId}>{control.label}</Label>
        <span className="text-muted-foreground tabular-nums">
          {formatSliderValue(value, control)}
        </span>
      </div>
      <Slider
        aria-labelledby={labelId}
        className={SLIDER_CLASS_NAME}
        max={control.maximum}
        min={control.minimum}
        onValueChange={(next: number | readonly number[]) => {
          onValueChange(control.key, readSliderValue(next, control, value));
        }}
        step={control.step}
        value={value}
      />
    </div>
  );
}
