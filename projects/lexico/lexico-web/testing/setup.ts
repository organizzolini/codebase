import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// `createServerFn` only runs inside the Start server runtime, so a route that
// defines a server function would throw under test. This stand-in builds the
// same chain but calls the handler directly, which is all a route test needs.
vi.mock(import("@tanstack/react-start"), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    createServerFn: (() => {
      const builder = {
        handler: (handler: (input: unknown) => unknown) => handler,
        validator: () => builder,
      };

      return builder;
    }) as unknown as typeof original.createServerFn,
  };
});

afterEach(() => {
  cleanup();
});
