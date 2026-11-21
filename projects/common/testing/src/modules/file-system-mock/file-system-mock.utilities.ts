import { vi } from "vitest";

import { FILE_SYSTEM_FUNCTIONS } from "./file-system-mock.constants";

import type { FileSystemMock } from "./file-system-mock.types";

/** Builds a file-system `vi.mock` factory's module, served as named and `default` exports; given the real module, functions are spies running for real. */
export function mockFileSystem(
  actual?: Readonly<Record<string, unknown>>,
): FileSystemMock {
  const members =
    actual === undefined
      ? Object.fromEntries(FILE_SYSTEM_FUNCTIONS.map((name) => [name, vi.fn()]))
      : Object.fromEntries(
          Object.entries(actual)
            .filter(([name]) => name !== "default")
            .map(([name, value]) => [
              name,
              isFunction(value) ? vi.fn(value) : value,
            ]),
        );

  return { ...members, default: members };
}

/** Whether a module member is a function, which a spy can wrap. */
function isFunction(
  value: unknown,
): value is (...parameters: never[]) => unknown {
  return typeof value === "function";
}
