import { useEffect } from "react";

import { useNightSky } from "../../hooks/use-night-sky/use-night-sky";
import { useNightSkyOpacity } from "../../hooks/use-night-sky/use-night-sky-opacity";

import { NightSkyBackdrop } from "./night-sky-backdrop";
import {
  BACKDROP_CLASS_NAME,
  SURFACE_OPACITY_PROPERTY,
} from "./night-sky-backdrop.constants";

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
  const { skyOpacity, surfaceOpacity } = useNightSkyOpacity();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // The calendar's surfaces, and the popovers portaled outside the page,
  // read the opacity from the root, as `bg-background/(--surface-opacity)`.
  useEffect(() => {
    const root = document.documentElement;

    // A percentage, as Tailwind mixes the color by the variable as it is.
    root.style.setProperty(
      SURFACE_OPACITY_PROPERTY,
      `${Math.round(surfaceOpacity * 100)}%`,
    );

    return () => {
      root.style.removeProperty(SURFACE_OPACITY_PROPERTY);
    };
  }, [surfaceOpacity]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-backdrop-mount"
    >
      <NightSkyBackdrop
        className={BACKDROP_CLASS_NAME}
        opacity={skyOpacity}
        sky={sky}
      />
    </div>
  );
}
