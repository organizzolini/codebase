// ♟️ Constants

/**
 * The codependix command line's loader. Constructor injection needs decorator
 * metadata, which only `@swc-node/register` emits; `tsx` and esbuild silently omit it.
 */
export const LOADER_SPECIFIER = "@codependix/nx/loader";

/**
 * The codependix command line's entry, resolved through `@codependix/cli`'s
 * exports so an installed copy finds its own build.
 */
export const CLI_ENTRY_SPECIFIER = "@codependix/cli/main";

/**
 * Filename of the registration, read for the `configurationPath` an executor
 * was not given. Nx passes plugin options only to `createNodes`.
 */
export const NX_CONFIGURATION_FILENAME = "nx.json";

/**
 * What the configuration refusal names when the executor's `configuration`
 * option is blank.
 */
export const EXECUTOR_OPTION_SURFACE = "`configuration` executor option";

/**
 * Why a cached target may not judge other projects: Nx would replay stale
 * passes, as its inputs cover only itself and its dependencies.
 */
export const UNCACHEABLE_SELECTION_MESSAGE =
  "The codependix gate target judges projects its cache inputs do not cover, so it must set `cache: false`.";
