import { z } from "zod";

/** Each is optional, since each command decides which it needs. */
export const environmentSchema = z.object({
  /** Set by most CI providers; `installed-skills` words its remediation for a cloud agent. */
  CI: z.string().optional(),
  /** Set by GitHub Actions; read the same way as `CI`. */
  GITHUB_ACTIONS: z.string().optional(),
  /** Where `go install` puts what it builds, which `software` also reads; unset, `~/.local/bin`. */
  GOBIN: z.string().optional(),
  /**
   * The file GitHub Actions reads extra `PATH` entries from. The `tools`
   * command adds the directory it installs into; unset, as it is on a
   * developer's machine, it adds nothing.
   */
  GITHUB_PATH: z.string().optional(),
  /** Set to anything to make `installed-skills write` restore present skills too. */
  SKILLS_INSTALL_FORCE: z.string().optional(),
  /** Set to anything to make `installed-skills write` leave skills alone. */
  SKIP_SKILLS_INSTALL: z.string().optional(),
  /**
   * The bearer token the `shared-nx-cache` command accepts, and the one Nx itself
   * sends. Unset, a built-in token is used, since the server is local.
   */
  NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN: z.string().optional(),
});
