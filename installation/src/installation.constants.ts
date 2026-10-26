import { z } from "zod";

/**
 * The variables the commands read. Each is optional, because a command decides
 * which it needs.
 */
export const environmentSchema = z.object({
  /**
   * The file GitHub Actions reads extra `PATH` entries from. The `tools`
   * command adds the directory it installs into; unset, as it is on a
   * developer's machine, it adds nothing.
   */
  GITHUB_PATH: z.string().optional(),
});
