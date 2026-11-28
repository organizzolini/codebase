import { useRouterState } from "@tanstack/react-router";

import { readNightSkyOverrides } from "../../use-night-sky.utilities";

import type { UseNightSkyOpacityResult } from "./use-night-sky-opacity.types";

// 🧩 Hook

/** The link's skyfield opacity, defaulted when absent; reads only that key, so other sky changes skip a render. */
export function useNightSkyOpacity(): UseNightSkyOpacityResult {
  // 🪝 Hooks
  const skyOpacity = useRouterState({
    select: (state: {
      location: { search: Readonly<Record<string, unknown>> };
    }) => readNightSkyOverrides(state.location.search).skyOpacity,
  });

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🎁 Result
  return { skyOpacity };
}
