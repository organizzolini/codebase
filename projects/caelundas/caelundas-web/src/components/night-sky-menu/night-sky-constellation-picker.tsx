import { Button } from "@codebase/presentation";

import { NightSkyConstellationFolder } from "./night-sky-constellation-folder";
import { CONSTELLATION_CHOICES } from "./night-sky-menu.constants";
import {
  isChoiceActive,
  listShownConstellations,
  splitConstellations,
  toggleConstellations,
} from "./night-sky-menu.utilities";

import type { ConstellationListing } from "../../hooks/use-night-sky/night-sky.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The constellations to pick from, the words the link holds, and where to
 * send a new choice.
 */
export interface NightSkyConstellationPickerProperties {
  className?: string;
  constellations: readonly ConstellationListing[];
  onWordsChange: (words: string[]) => void;
  words: readonly string[];
}

// 🧩 Component

/**
 * Renders which constellations' figures the sky draws: Zodiac, All and None
 * in one press, then a tree of two folders, the zodiac's twelve, open, and
 * every other, closed, in a list that scrolls on its own so the menu around
 * it keeps its height.
 */
export function NightSkyConstellationPicker(
  properties: Readonly<NightSkyConstellationPickerProperties>,
): ReactNode {
  const { className, constellations, onWordsChange, words } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const shown = listShownConstellations(words, constellations);
  const { other, zodiac } = splitConstellations(constellations);

  // 💪 Handlers
  const handleToggle = (names: readonly string[]): void => {
    onWordsChange(toggleConstellations(words, constellations, names));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-constellation-picker"
    >
      <fieldset className="flex flex-col gap-2">
        {/* The section header above already reads Constellations. */}
        <legend className="sr-only">Constellations</legend>
        <div className="flex gap-1">
          {CONSTELLATION_CHOICES.map((choice) => (
            <Button
              key={choice.label}
              aria-pressed={isChoiceActive(choice.words, words)}
              onClick={() => {
                onWordsChange([...choice.words]);
              }}
              size="sm"
              variant={
                isChoiceActive(choice.words, words) ? "secondary" : "outline"
              }
            >
              {choice.label}
            </Button>
          ))}
        </div>
        <div
          aria-label="Constellations to draw"
          className="max-h-64 overflow-y-auto overscroll-contain rounded-md border p-1"
          role="group"
        >
          <NightSkyConstellationFolder
            constellations={zodiac}
            label="Zodiac"
            onToggle={handleToggle}
            shown={shown}
            defaultOpen
          />
          <NightSkyConstellationFolder
            constellations={other}
            label="Other constellations"
            onToggle={handleToggle}
            shown={shown}
          />
        </div>
      </fieldset>
    </div>
  );
}
