import "@codebase/testing/react/setup";

import { afterAll, afterEach, beforeAll, vi } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/testing/graphql";
import { createServerFunctionStandIn } from "@codebase/testing/react";

// `createServerFn` only runs inside the Start server runtime, so a route that
// defines a server function would throw under test; the shared stand-in builds
// the same chain but hands the handler back to be called directly.
vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createServerFn: createServerFunctionStandIn,
}));

beforeAll(() => {
  startGraphqlMockServer();
});

afterEach(() => {
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
