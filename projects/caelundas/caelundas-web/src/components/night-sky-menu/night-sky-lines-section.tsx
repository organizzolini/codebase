import { Label, Switch } from "@codebase/presentation";

import { NightSkyColorField } from "./night-sky-color-field";
import {
  COLUMN_CLASS_NAME,
  ECLIPTIC_COLOR,
  ECLIPTIC_SLIDERS,
  LINE_COLOR,
  LINE_SLIDERS,
} from "./night-sky-menu.constants";
import {
  toEclipticChange,
  toSkyParameterChange,
} from "./night-sky-menu.utilities";
import { NightSkySection } from "./night-sky-section";
import { NightSkySliders } from "./night-sky-sliders";

import type { NightSkyOverrides } from "../../hooks/use-night-sky/use-night-sky.types";
import type { SkySearchChange } from "./night-sky-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The line settings and the link change handler.
 */
export interface NightSkyLinesSectionProperties {
  className?: string;
  onChange: (change: SkySearchChange) => void;
  settings: NightSkyOverrides;
}

// 🧩 Component

/**
 * Renders the Sky menu's line controls: the constellation figures' stroke,
 * then the ecliptic's switch and stroke.
 */
export function NightSkyLinesSection(
  properties: Readonly<NightSkyLinesSectionProperties>,
): ReactNode {
  const { className, onChange, settings } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleSettingChange = (
    ...parameters: Parameters<typeof toSkyParameterChange>
  ): void => {
    onChange(toSkyParameterChange(...parameters));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-lines-section"
    >
      <div className={COLUMN_CLASS_NAME}>
        <NightSkySection title="Constellation lines">
          <NightSkySliders
            controls={LINE_SLIDERS}
            onValueChange={handleSettingChange}
            settings={settings}
          />
          <NightSkyColorField
            control={LINE_COLOR}
            onValueChange={handleSettingChange}
            value={settings[LINE_COLOR.field]}
          />
        </NightSkySection>
        <NightSkySection title="Ecliptic">
          <Label className="justify-between text-xs">
            Show the ecliptic
            <Switch
              checked={settings.ecliptic}
              onCheckedChange={(checked: boolean) => {
                onChange(toEclipticChange(checked));
              }}
            />
          </Label>
          <NightSkySliders
            controls={ECLIPTIC_SLIDERS}
            onValueChange={handleSettingChange}
            settings={settings}
          />
          <NightSkyColorField
            control={ECLIPTIC_COLOR}
            onValueChange={handleSettingChange}
            value={settings[ECLIPTIC_COLOR.field]}
          />
        </NightSkySection>
      </div>
    </div>
  );
}
