// ♟️ Constants

import { z } from "zod";

/** Where the release configuration lives, from the repository root. */
export const RELEASE_CONFIGURATION_PATH =
  "configuration/repository/release.config.cjs";

/** What a release adds to the environment: Husky's hooks off. */
export const RELEASE_ENVIRONMENT = { HUSKY: "0" };

/** One plugin entry: a name, or a name with its options. */
export const pluginSchema = z.union([
  z.string(),
  z.tuple([z.string(), z.unknown()]),
]);

/** An aggregate failure: the failures it gathers, one per failed step. */
export const aggregateFailureSchema = z.object({
  errors: z.array(z.unknown()),
});

/** The parts of the release configuration this module relies on. */
export const releaseConfigurationSchema = z.looseObject({
  branches: z.array(z.string()),
  plugins: z.array(pluginSchema),
});
