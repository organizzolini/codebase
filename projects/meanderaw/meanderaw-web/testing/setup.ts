import "@codebase/testing/react/setup";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";

import { installViewport } from "./viewport";

// jsdom does not scroll, and the router asks it to on every navigation.
globalThis.scrollTo = (): void => {};
// Nor does it scroll an element into view.
Element.prototype.scrollIntoView = (): void => {};

beforeAll(() => {
  startGraphqlMockServer();
});

beforeEach(() => {
  installViewport();
});

afterEach(() => {
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
