import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * The named configuration answers alone, and nothing is merged.
 *
 * Codometer never searches for a configuration: the file `--config` names is
 * the only one read. Three files sit above this one — this package's, and the
 * workspace root's, which is itself a re-export of
 * `configuration/codometer.config.ts` — and none of them contributes
 * anything to a run that names this file.
 *
 * That is visible rather than asserted, because the counter below exists
 * nowhere else:
 *
 * ```bash
 * # This file answers: one badge, "Configurations", and no "Service Files".
 * cd projects/ic-suite/codometer/codometer-examples/examples/discovery/nested
 * codometer --config codometer.config.ts
 *
 * # The same folder's parent, naming the package's configuration: "Service
 * # Files" and "Unit Tests" return, "Configurations" does not — and so does
 * # the package's own "Corpus" input, now reported empty since this folder
 * # holds no `examples/corpus/`. See this package's own guide for why one
 * # plain configuration file answers for both cases.
 * cd projects/ic-suite/codometer/codometer-examples/examples/discovery
 * codometer --config ../../codometer.config.ts
 * ```
 *
 * Merging two files would leave a limit that never applied looking exactly
 * like one that did, and telling them apart would mean knowing which of
 * several files each field came from. So a project that writes its own file
 * replaces a shared description rather than editing it.
 */
const codometerConfiguration: CodometerConfiguration = {
  custom: [
    {
      color: "9333ea",
      label: "Configurations",
      patterns: ["**/*.config.ts"],
    },
  ],
  format: "markdown",
};

export default codometerConfiguration;
