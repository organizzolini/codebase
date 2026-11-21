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
// Nor does it scroll an element into view, scroll one, or animate: the scroll
// areas of the shared components ask after animations as they hide their
// scrollbars.
Element.prototype.scrollIntoView = (): void => {};
Element.prototype.scrollTo = (): void => {};
Element.prototype.getAnimations = (): Animation[] => [];

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
