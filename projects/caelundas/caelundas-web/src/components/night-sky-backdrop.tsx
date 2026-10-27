import { useNightSky } from "./use-night-sky";

import type { ReactNode } from "react";

// The backdrop is fixed to the viewport and behind the content, out of reach
// of the pointer, and its SVG fills it.
const BACKDROP_CLASS_NAME =
  "pointer-events-none fixed inset-0 -z-10 overflow-hidden [&_svg]:size-full";

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

/**
 * Renders the night sky the link asks for behind the page. It draws nothing
 * until the sky is built in the browser, so the static shell is unchanged.
 */
export function NightSkyBackdropMount(): ReactNode {
  return (
    <NightSkyBackdrop
      className={BACKDROP_CLASS_NAME}
      sky={useNightSky()}
    />
  );
}
