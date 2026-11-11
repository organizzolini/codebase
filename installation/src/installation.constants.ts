import { z } from "zod";

/** Each is optional, since each command decides which it needs. */
export const environmentSchema = z.object({
  /**
   * The file GitHub Actions reads extra `PATH` entries from. The `tools`
   * command adds the directory it installs into; unset, as it is on a
   * developer's machine, it adds nothing.
   */
  GITHUB_PATH: z.string().optional(),
  /**
   * The bearer token the `shared-nx-cache` command accepts, and the one Nx itself
   * sends. Unset, a built-in token is used, since the server is local.
   */
  NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN: z.string().optional(),
});
