import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";

import { clearCalendarCaches } from "../src/components/events-calendar/calendar-loader.utilities";

import { installViewport } from "./viewport";

// jsdom lays nothing out, so it neither scrolls, animates nor resizes an
// element. The time grid scrolls to its first hour and watches its
// scrollbar's width on mount, and the scroll areas ask after animations as
// they hide their scrollbars, all of which do nothing here.
const ignore = (): void => {};

Element.prototype.scrollTo = ignore;
Element.prototype.getAnimations = (): Animation[] => [];
// A resize observer reports its element's size as soon as it observes it,
// as a browser's does, read from whatever size a test gives the element.
globalThis.ResizeObserver = class {
  constructor(callback: ResizeObserverCallback) {
    this.observe = (target) => {
      callback(
        [
          {
            borderBoxSize: [],
            contentBoxSize: [],
            contentRect: target.getBoundingClientRect(),
            devicePixelContentBoxSize: [],
            target,
          },
        ],
        this,
      );
    };
  }
  disconnect = ignore;
  observe: (target: Element) => void;

  unobserve = ignore;
};

beforeAll(() => {
  startGraphqlMockServer();
});

beforeEach(() => {
  installViewport();
});

afterEach(() => {
  cleanup();
  clearCalendarCaches();
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
