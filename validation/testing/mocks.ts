import { vi } from "vitest";

import type { MockInstance } from "vitest";

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
