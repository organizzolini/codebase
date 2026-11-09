import { NightSkyConstellationFolder } from "./night-sky-constellation-folder";
import { TREE_CLASS_NAME } from "./night-sky-menu.constants";
import {
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
 * Renders which constellations' figures the sky draws: a tree of folders in a list that scrolls on its own.
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
      <fieldset className="flex h-full flex-col lg:absolute lg:inset-0">
        {/* The column has no visible heading; the tree names itself. */}
        <legend className="sr-only">Constellations</legend>
        <div
          aria-label="Constellations to draw"
          className={TREE_CLASS_NAME}
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
