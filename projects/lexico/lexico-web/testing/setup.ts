import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import {
  resetGraphqlServer,
  startGraphqlServer,
  stopGraphqlServer,
} from "@codebase/interface/testing";

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

/**
 * A jsdom stand-in for `window.matchMedia`, which components read on render.
 */
function matchMedia(): MediaQueryList {
  return {
    addEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(),
    matches: false,
    media: "",
    onchange: null,
    removeEventListener: vi.fn<() => void>(),
  } as unknown as MediaQueryList;
}

vi.stubGlobal("matchMedia", matchMedia);
Object.defineProperty(globalThis.window, "matchMedia", {
  configurable: true,
  value: matchMedia,
  writable: true,
});

beforeAll(() => {
  startGraphqlServer();
});

afterEach(() => {
  cleanup();
  resetGraphqlServer();
});

afterAll(() => {
  stopGraphqlServer();
});
