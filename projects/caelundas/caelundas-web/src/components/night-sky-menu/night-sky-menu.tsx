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
  PANEL_CLASS_NAME,
  SKY_COLORS,
  SKY_SLIDERS,
} from "./night-sky-menu.constants";
import {
  keepKeysInPanel,
  toConstellationsChange,
  toResetChange,
  toSkyParameterChange,
  toVisibilityChange,
} from "./night-sky-menu.utilities";
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
 * follows a control live and a link reopens the same controls. It belongs
 * inside a dropdown menu.
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
            className="gap-3 p-2"
            onKeyDown={keepKeysInPanel}
          >
            <Label className="justify-between text-xs">
              Show the sky
              <Switch
                checked={!settings.off}
                onCheckedChange={(checked: boolean) => {
                  change(toVisibilityChange(checked));
                }}
              />
            </Label>
            <NightSkyConstellationPicker
              constellations={constellations}
              onWordsChange={(words) => {
                change(toConstellationsChange(words));
              }}
              words={settings.constellations}
            />
            {SKY_SLIDERS.map((control) => (
              <NightSkySlider
                key={control.key}
                control={control}
                onValueChange={handleSettingChange}
                value={settings[control.field]}
              />
            ))}
            {SKY_COLORS.map((control) => (
              <NightSkyColorField
                key={control.key}
                control={control}
                onValueChange={handleSettingChange}
                value={settings[control.field]}
              />
            ))}
            <Button
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
