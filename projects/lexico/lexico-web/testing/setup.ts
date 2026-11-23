import "@codebase/testing/react/setup";

import { afterAll, afterEach, beforeAll, vi } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";
import {
  createServerFunctionStandIn,
  matchMediaStandIn,
} from "@codebase/testing/react";

// `createServerFn` only runs inside the Start server runtime, so a route that
// defines a server function would throw under test; the shared stand-in builds
// the same chain but hands the handler back to be called directly.
vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createServerFn: createServerFunctionStandIn,
}));

vi.stubGlobal("matchMedia", matchMediaStandIn);

// jsdom has no layout, so the command list's size watcher and scroll-to-item
// have nothing to do; stand-ins keep a searchable checklist mountable.
vi.stubGlobal(
  "ResizeObserver",
  class {
    public disconnect = vi.fn<() => void>();
    public observe = vi.fn<() => void>();
    public unobserve = vi.fn<() => void>();
  },
);
Element.prototype.scrollIntoView = vi.fn<Element["scrollIntoView"]>();

beforeAll(() => {
  startGraphqlMockServer();
});

afterEach(() => {
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
