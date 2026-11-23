// 🏷️ Types

import type { releaseConfigurationSchema } from "./semantic-release.constants";
import type { z } from "zod";

/** The release configuration, as far as this module reads it. */
export type ReleaseConfiguration = z.infer<typeof releaseConfigurationSchema>;

/** What a release can be asked for. */
export interface ReleaseOptions {
  /** Whether to preview the release without making it. */
  readonly dryRun?: boolean;
}
