import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/testing/graphql";
import { matchMediaStandIn } from "@codebase/testing/react";

// `createServerFn` only runs inside the Start server runtime, so a route that
// defines a server function would throw under test; the shared stand-in builds
// the same chain but hands the handler back to be called directly.
vi.mock("@tanstack/react-start", async (importOriginal) => {
  const { createServerFunctionStandIn } =
    await import("@codebase/testing/react");

  return {
    ...(await importOriginal<object>()),
    createServerFn: createServerFunctionStandIn,
  };
});

vi.stubGlobal("matchMedia", matchMediaStandIn);

beforeAll(() => {
  startGraphqlMockServer();
});

afterEach(() => {
  cleanup();
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
