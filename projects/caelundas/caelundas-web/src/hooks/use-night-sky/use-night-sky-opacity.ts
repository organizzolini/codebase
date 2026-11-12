import { useRouterState } from "@tanstack/react-router";

import { readNightSkyOverrides } from "./use-night-sky.utilities";

import type { UseNightSkyOpacityResult } from "./use-night-sky-opacity.types";

// 🧩 Hook

/** The link's sky and surface opacities, defaulted where absent; reads only those keys, so other sky changes skip a render. */
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
