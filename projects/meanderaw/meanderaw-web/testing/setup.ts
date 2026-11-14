import "@codebase/testing/react/setup";
import { afterAll, afterEach, beforeAll } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";

// jsdom does not scroll, and the router asks it to on every navigation.
globalThis.scrollTo = (): void => {};

beforeAll(() => {
  startGraphqlMockServer();
});

afterEach(() => {
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
