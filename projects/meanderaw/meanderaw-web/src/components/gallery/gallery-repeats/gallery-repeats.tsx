import { REPEAT_OPTIONS } from "./gallery-repeats.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The repeats showing, and what to call to pick another count.
 */
export interface GalleryRepeatsProperties {
  className?: string;
  onRepeatsChange: (repeats: number) => void;
  repeats: number;
}

// 🧩 Component

/**
 * Renders the control that sets how many times each drawing repeats its tile.
 */
export function GalleryRepeats(
  properties: Readonly<GalleryRepeatsProperties>,
): ReactNode {
  const { className, onRepeatsChange, repeats } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-repeats"
    >
      <label className="flex items-center gap-2 text-sm">
        Repeats
        <select
          className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
          onChange={(event) => {
            onRepeatsChange(Number(event.target.value));
          }}
          value={repeats}
        >
          {REPEAT_OPTIONS.map((count) => (
            <option
              key={count}
              value={count}
            >
              {count}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
