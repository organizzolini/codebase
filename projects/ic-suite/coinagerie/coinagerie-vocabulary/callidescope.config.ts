import { projectDefaults } from "../../../../configuration/callidescope.config.js";

/**
 * What coinagerie-vocabulary is held to, measured rather than assumed.
 *
 * Seven frames from `VocabularyService.collect` down through discovery's walk
 * into the ignore rules, and seven callees in `DiscoveryService.discover`,
 * which chains the walk, the ancestor scopes, the skip list, and the globs.
 *
 * Set **at** what the gate measured rather than above it: a stack at the
 * limit passes, so the number is a starting point to ratchet down from rather
 * than a target to grow into.
 *
 * @see configuration/callidescope.config.ts — `projectDefaults`, spread below
 * for everything this file does not override
 */
export default {
  ...projectDefaults,
  limits: {
    maximumBreadth: 7,
    maximumDepth: 7,
  },
};
