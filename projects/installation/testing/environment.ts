import { vi } from "vitest";

import type { TemporaryWorkspace } from "./temporary-workspace";

/**
 * Points this process at a temporary workspace: its working directory, its
 * home directory, and the shell it claims to run under.
 *
 * Undone by `vi.unstubAllEnvs()` and `vi.restoreAllMocks()`.
 */
export function enterWorkspace(
  workspace: TemporaryWorkspace,
  shell = "/bin/zsh",
): void {
  vi.spyOn(process, "cwd").mockReturnValue(workspace.root);
  vi.stubEnv("HOME", workspace.home);
  vi.stubEnv("SHELL", shell);
  // These suites run under Nx, which sets this; the code under test reads it.
  vi.stubEnv("NX_TASK_TARGET_PROJECT", undefined);
}
