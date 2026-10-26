import type { ServerFunctionBuilder } from "./browser-stand-ins.types";

/**
 * A stand-in for TanStack Start's `createServerFn`, which only runs inside
 * the Start server runtime, so a route that defines a server function would
 * throw under test. A web application swaps it in from its setup file:
 *
 * ```ts
 * vi.mock("@tanstack/react-start", async (importOriginal) => ({
 *   ...(await importOriginal<object>()),
 *   createServerFn: (await import("@codebase/testing/react"))
 *     .createServerFunctionStandIn,
 * }));
 * ```
 */
export function createServerFunctionStandIn(
  _options?: unknown,
): ServerFunctionBuilder {
  const builder: ServerFunctionBuilder = {
    handler: passThrough,
    validator: () => builder,
  };

  return builder;
}

/**
 * A jsdom stand-in for `window.matchMedia`, which components read on render:
 * every query reports no match and no listener is ever called.
 */
export function matchMediaStandIn(query: string): MediaQueryList {
  return {
    addEventListener: ignore,
    addListener: ignore,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: ignore,
    removeListener: ignore,
  };
}

/** Does nothing, as a listener registration the stand-in never acts on. */
function ignore(): void {}

/** Hands its argument back unchanged. */
function passThrough<Value>(value: Value): Value {
  return value;
}
