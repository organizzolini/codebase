import { useRouterState } from "@tanstack/react-router";

import { readNightSkyOverrides } from "./use-night-sky.utilities";

import type { UseNightSkyOpacityResult } from "./use-night-sky-opacity.types";

// 🧩 Hook

/**
 * The two opacities the link sets, each defaulted where absent: how opaque
 * the night sky is drawn, and how opaque the calendar's surfaces are over it.
 * It reads only those keys, so the page is not rendered for any other sky
 * change.
 */
export function useNightSkyOpacity(): UseNightSkyOpacityResult {
  // 🪝 Hooks
  const skyOpacity = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search).skyOpacity,
  });
  const surfaceOpacity = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search).surfaceOpacity,
  });

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return { skyOpacity, surfaceOpacity };
}
