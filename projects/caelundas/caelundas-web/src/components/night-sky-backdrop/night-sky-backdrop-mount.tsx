import { useNightSky } from "../../hooks/use-night-sky/use-night-sky";

import { NightSkyBackdrop } from "./night-sky-backdrop";
import { BACKDROP_CLASS_NAME } from "./night-sky-backdrop.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * How the mounted backdrop is placed.
 */
export interface NightSkyBackdropMountProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the night sky the link asks for behind the page. It draws nothing
 * until the sky is built in the browser, so the static shell is unchanged.
 */
export function NightSkyBackdropMount(
  properties: Readonly<NightSkyBackdropMountProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  const { sky } = useNightSky();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-backdrop-mount"
    >
      <NightSkyBackdrop
        className={BACKDROP_CLASS_NAME}
        sky={sky}
      />
    </div>
  );
}
