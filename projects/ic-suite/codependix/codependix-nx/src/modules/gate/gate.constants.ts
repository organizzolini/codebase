// ♟️ Constants

/** CLI loader: `tsx` and esbuild omit decorator metadata; use swc. */
export const LOADER_SPECIFIER = "@codependix/nx/loader";

/** CLI entry, via `@codependix/cli`'s exports, so its own build loads. */
export const CLI_ENTRY_SPECIFIER = "@codependix/cli/main";

/** Registration file for `configurationPath`; plugin options reach only `createNodes`. */
export const NX_CONFIGURATION_FILENAME = "nx.json";

/**
 * What the configuration refusal names when the executor's `configuration`
 * option is blank.
 */
export const EXECUTOR_OPTION_SURFACE = "`configuration` executor option";

/** Cached targets judge only themselves, or Nx replays stale passes. */
export const UNCACHEABLE_SELECTION_MESSAGE =
  "The codependix gate target judges projects its cache inputs do not cover, so it must set `cache: false`.";
