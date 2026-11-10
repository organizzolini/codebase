import { Galaxy } from "lucide-react";

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FieldSet,
  Label,
  Switch,
} from "@codebase/presentation";

import { useNightSkySettings } from "../../hooks/use-night-sky/use-night-sky-settings";

import { NightSkyColorField } from "./night-sky-color-field";
import { NightSkyConstellationPicker } from "./night-sky-constellation-picker";
import { NightSkyLinesSection } from "./night-sky-lines-section";
import {
  ANGLE_SLIDERS,
  BACKGROUND_COLORS,
  COLUMN_CLASS_NAME,
  OPACITY_SLIDERS,
  PANEL_CLASS_NAME,
  STAR_SLIDERS,
} from "./night-sky-menu.constants";
import {
  keepKeysInPanel,
  toConstellationsChange,
  toResetChange,
  toSkyParameterChange,
  toVisibilityChange,
} from "./night-sky-menu.utilities";
import { NightSkySection } from "./night-sky-section";
import { NightSkySliders } from "./night-sky-sliders";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Where the Sky menu sits in the toolbar.
 */
export interface NightSkyMenuProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the toolbar's Sky menu: each night sky setting, read from and written back to the link as it changes.
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
      <ButtonGroup aria-label="Sky menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label="Sky options"
                size="sm"
                variant="outline"
              />
            }
          >
            <Galaxy aria-hidden="true" />
            Sky
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={PANEL_CLASS_NAME}
            sideOffset={8}
          >
            <FieldSet
              aria-label="Night sky settings"
              className="grid gap-x-5 gap-y-1 p-2 md:grid-cols-2 lg:grid-cols-4"
              onKeyDown={keepKeysInPanel}
            >
              <div className={COLUMN_CLASS_NAME}>
                <NightSkySection title="Sky">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="gap-2 text-xs">
                      Show the sky
                      <Switch
                        checked={!settings.off}
                        onCheckedChange={(checked: boolean) => {
                          change(toVisibilityChange(checked));
                        }}
                      />
                    </Label>
                    <Button
                      onClick={() => {
                        change(toResetChange());
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Default
                    </Button>
                  </div>
                  {BACKGROUND_COLORS.map((control) => (
                    <NightSkyColorField
                      key={control.key}
                      control={control}
                      onValueChange={handleSettingChange}
                      value={settings[control.field]}
                    />
                  ))}
                  <NightSkySliders
                    controls={OPACITY_SLIDERS}
                    onValueChange={handleSettingChange}
                    settings={settings}
                  />
                </NightSkySection>
                <NightSkySection title="Stars">
                  <NightSkySliders
                    controls={STAR_SLIDERS}
                    onValueChange={handleSettingChange}
                    settings={settings}
                  />
                </NightSkySection>
              </div>
              <NightSkySection title="Angles">
                <NightSkySliders
                  controls={ANGLE_SLIDERS}
                  onValueChange={handleSettingChange}
                  settings={settings}
                />
              </NightSkySection>
              <NightSkyLinesSection
                onChange={change}
                settings={settings}
              />
              <NightSkyConstellationPicker
                className="relative min-h-0"
                constellations={constellations}
                onWordsChange={(words) => {
                  change(toConstellationsChange(words));
                }}
                words={settings.constellations}
              />
            </FieldSet>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}
