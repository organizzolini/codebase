import {
  Button,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  FieldSet,
  Label,
  Switch,
} from "@codebase/presentation";

import { useNightSkySettings } from "../../hooks/use-night-sky/use-night-sky-settings";

import { NightSkyColorField } from "./night-sky-color-field";
import { NightSkyConstellationPicker } from "./night-sky-constellation-picker";
import {
  BACKGROUND_COLORS,
  LINE_COLOR,
  LINE_SLIDERS,
  PANEL_CLASS_NAME,
  STAR_SLIDERS,
  VIEW_SLIDERS,
} from "./night-sky-menu.constants";
import {
  keepKeysInPanel,
  toConstellationsChange,
  toResetChange,
  toSkyParameterChange,
  toVisibilityChange,
} from "./night-sky-menu.utilities";
import { NightSkySection } from "./night-sky-section";
import { NightSkySlider } from "./night-sky-slider";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Where the Night sky submenu sits in the View menu.
 */
export interface NightSkyMenuProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the View menu's Night sky submenu: every setting of the backdrop,
 * read from the link and written back to it as it changes, so the sky
 * follows a control live and a link reopens the same controls. Its sections
 * open, but for Constellations, whose picker is last and closed, so every
 * other setting shows at once. It belongs inside a dropdown menu.
 */
export function NightSkyMenu(
  properties: Readonly<NightSkyMenuProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  const { change, constellations, settings } = useNightSkySettings();

  // 🏗 Setup

  // 💪 Handlers
  const handleSettingChange = (
    ...parameters: Parameters<typeof toSkyParameterChange>
  ): void => {
    change(toSkyParameterChange(...parameters));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-menu"
    >
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Night sky</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className={PANEL_CLASS_NAME}>
          <FieldSet
            aria-label="Night sky settings"
            className="gap-1 p-2"
            onKeyDown={keepKeysInPanel}
          >
            <NightSkySection title="Sky">
              <Label className="justify-between text-xs">
                Show the sky
                <Switch
                  checked={!settings.off}
                  onCheckedChange={(checked: boolean) => {
                    change(toVisibilityChange(checked));
                  }}
                />
              </Label>
            </NightSkySection>
            <NightSkySection title="View angles">
              {VIEW_SLIDERS.map((control) => (
                <NightSkySlider
                  key={control.key}
                  control={control}
                  onValueChange={handleSettingChange}
                  value={settings[control.field]}
                />
              ))}
            </NightSkySection>
            <NightSkySection title="Stars">
              {STAR_SLIDERS.map((control) => (
                <NightSkySlider
                  key={control.key}
                  control={control}
                  onValueChange={handleSettingChange}
                  value={settings[control.field]}
                />
              ))}
            </NightSkySection>
            <NightSkySection title="Colors">
              {BACKGROUND_COLORS.map((control) => (
                <NightSkyColorField
                  key={control.key}
                  control={control}
                  onValueChange={handleSettingChange}
                  value={settings[control.field]}
                />
              ))}
            </NightSkySection>
            <NightSkySection
              defaultOpen={false}
              title="Constellations"
            >
              {LINE_SLIDERS.map((control) => (
                <NightSkySlider
                  key={control.key}
                  control={control}
                  onValueChange={handleSettingChange}
                  value={settings[control.field]}
                />
              ))}
              <NightSkyColorField
                control={LINE_COLOR}
                onValueChange={handleSettingChange}
                value={settings[LINE_COLOR.field]}
              />
              <NightSkyConstellationPicker
                constellations={constellations}
                onWordsChange={(words) => {
                  change(toConstellationsChange(words));
                }}
                words={settings.constellations}
              />
            </NightSkySection>
            <Button
              className="mt-1"
              onClick={() => {
                change(toResetChange());
              }}
              size="sm"
              variant="outline"
            >
              Reset to defaults
            </Button>
          </FieldSet>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </div>
  );
}
