import "@codebase/testing/react/setup";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

import {
  resetGraphqlMockServer,
  startGraphqlMockServer,
  stopGraphqlMockServer,
} from "@codebase/interface/testing";

import { CATALOG_CACHE } from "../src/components/calendar-display/calendar-metrics/components/metric-catalog-provider/metric-catalog-provider.constants";
import {
  CONSTANTS_CACHE,
  EVENTS_CACHE,
  FACETS_CACHE,
} from "../src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.constants";
import { METRICS_CACHE } from "../src/hooks/use-metric-layout/hooks/use-event-metrics/use-event-metrics.constants";

import { installViewport } from "./viewport";

// jsdom lays nothing out, so it neither scrolls, animates nor resizes an
// element. The time grid scrolls to its first hour and watches its
// scrollbar's width on mount, and the scroll areas ask after animations as
// they hide their scrollbars, all of which do nothing here.
const ignore = (): void => {};

Element.prototype.scrollTo = ignore;
globalThis.scrollTo = ignore;
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
  // The constants files, not the loader's utilities, which would load the
  // whole filter and grouping model into every test file's setup.
  CONSTANTS_CACHE.clear();
  EVENTS_CACHE.clear();
  FACETS_CACHE.clear();
  METRICS_CACHE.clear();
  CATALOG_CACHE.clear();
  resetGraphqlMockServer();
});

afterAll(() => {
  stopGraphqlMockServer();
});
