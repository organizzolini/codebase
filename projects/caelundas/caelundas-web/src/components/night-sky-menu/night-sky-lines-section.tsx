import { Label, Switch } from "@codebase/presentation";

import { NightSkyColorField } from "./night-sky-color-field";
import {
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
 * The settings the Lines section shows and where to send a change to the
 * link.
 */
export interface NightSkyLinesSectionProperties {
  className?: string;
  onChange: (change: SkySearchChange) => void;
  settings: NightSkyOverrides;
}

// 🧩 Component

/**
 * Renders the Sky menu's Lines section: the ecliptic's switch and stroke,
 * then the constellation figures' stroke.
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
      <NightSkySection title="Lines">
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
    </div>
  );
}
