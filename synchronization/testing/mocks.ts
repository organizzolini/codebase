import { expect, vi } from "vitest";

import type { MockInstance } from "vitest";

/** Shape of a directory entry returned by readdirSync in tests. */
export interface DirectoryEntry {
  isDirectory: () => boolean;
  name: string;
}

/**
 * Asserts that invoking the provided action exits the process with code 1.
 */
export async function expectProcessExitOne(
  action: () => Promise<void> | void,
): Promise<void> {
  const processExitSpy = mockProcessExit();

  await expect(Promise.resolve().then(action)).rejects.toThrow(
    "process.exit:1",
  );

  processExitSpy.mockRestore();
}

/**
 * Mocks process.exit by throwing an Error with the exit code.
 * Useful for command tests that assert exit behavior.
 */
export function mockProcessExit(): MockInstance<typeof process.exit> {
  return vi
    .spyOn(process, "exit")
    .mockImplementation((code?: null | number | string): never => {
      throw new Error(`process.exit:${code ?? 0}`);
    });
}
