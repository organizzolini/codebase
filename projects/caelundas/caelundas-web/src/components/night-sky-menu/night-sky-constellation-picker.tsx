import { Button, Checkbox } from "@codebase/presentation";

import { CONSTELLATION_CHOICES } from "./night-sky-menu.constants";
import {
  isChoiceActive,
  listShownConstellations,
  toggleConstellation,
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
 * in one press, then every constellation the database lists to show or hide
 * one at a time, in a list that scrolls on its own.
 */
export function NightSkyConstellationPicker(
  properties: Readonly<NightSkyConstellationPickerProperties>,
): ReactNode {
  const { className, constellations, onWordsChange, words } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const shown = listShownConstellations(words, constellations);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-constellation-picker"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium">Constellations</legend>
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
        <ul
          aria-label="Constellations to draw"
          className="max-h-40 overflow-y-auto rounded-md border p-1"
        >
          {constellations.map((constellation) => (
            <li key={constellation.name}>
              <label className="flex min-h-8 cursor-pointer items-center gap-2 rounded px-1 text-xs hover:bg-accent">
                <Checkbox
                  checked={shown.has(constellation.name)}
                  onCheckedChange={() => {
                    onWordsChange(
                      toggleConstellation(
                        words,
                        constellations,
                        constellation.name,
                      ),
                    );
                  }}
                />
                {constellation.name}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}
