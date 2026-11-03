import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the backdrop draws, and how it is placed.
 */
export interface NightSkyBackdropProperties {
  className?: string;
  /**
   * The sky's SVG markup, from `useNightSky`; nothing is drawn without it.
   */
  sky?: string | undefined;
}

// 🧩 Component

/**
 * Renders the night sky behind the page, hidden from assistive technology.
 */
export function NightSkyBackdrop(
  properties: Readonly<NightSkyBackdropProperties>,
): ReactNode {
  const { className, sky } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-hidden="true"
      className={className}
      data-testid="night-sky-backdrop"
    >
      <div
        className="size-full"
        // The markup is the generator's own, built from numbers and the
        // bundled catalog.
        dangerouslySetInnerHTML={{ __html: sky ?? "" }}
      />
    </div>
  );
}
