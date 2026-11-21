import { onTestFinished, vi } from "vitest";

/**
 * Makes `process.cwd()` return `directory` for the running test, real or
 * not, and restores it afterwards.
 */
export function useWorkingDirectory(directory: string): void {
  const spy = vi.spyOn(process, "cwd").mockReturnValue(directory);

  onTestFinished(() => {
    spy.mockRestore();
  });
}
