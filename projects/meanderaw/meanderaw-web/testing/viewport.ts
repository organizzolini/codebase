// jsdom lays nothing out, so every element is as wide as the viewport a test
// sets and as tall as one row of cards, and the window is as tall as a phone.

const DESKTOP_WIDTH = 1280;

/** How tall jsdom says every element is, in pixels. */
export const ELEMENT_HEIGHT = 300;

let viewportWidth = DESKTOP_WIDTH;

/** The elements watched for coming into view, by the callback watching. */
const watchers = new Map<Element, IntersectionObserverCallback>();

/**
 * Answers every element's size from the viewport a test sets, and tells each
 * watching resize observer the size of what it starts to watch.
 */
export function installViewport(): void {
  setViewportWidth(DESKTOP_WIDTH);
  Object.defineProperty(globalThis, "scrollY", {
    configurable: true,
    value: 0,
  });

  Element.prototype.getBoundingClientRect = () =>
    new DOMRect(0, 0, viewportWidth, ELEMENT_HEIGHT);
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: () => ELEMENT_HEIGHT,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: () => viewportWidth,
  });
  // A scrolling element, such as a menu's list, is measured by its client box.
  Object.defineProperty(Element.prototype, "clientHeight", {
    configurable: true,
    get: () => ELEMENT_HEIGHT,
  });
  Object.defineProperty(Element.prototype, "clientWidth", {
    configurable: true,
    get: () => viewportWidth,
  });
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
    disconnect = (): void => {};
    observe: (target: Element) => void;

    unobserve = (): void => {};
  };
  watchers.clear();
  globalThis.IntersectionObserver = class {
    constructor(private readonly callback: IntersectionObserverCallback) {}
    disconnect = (): void => {
      for (const [target, callback] of watchers) {
        if (callback === this.callback) {
          watchers.delete(target);
        }
      }
    };
    observe = (target: Element): void => {
      watchers.set(target, this.callback);
    };
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    takeRecords = (): IntersectionObserverEntry[] => [];
    readonly thresholds = [];
    unobserve = (target: Element): void => {
      watchers.delete(target);
    };
  };
}

/**
 * Tells every watcher that its element came into view, as scrolling to the
 * end of the page does.
 */
export function reachEnd(): void {
  for (const [target, callback] of watchers) {
    callback(
      [
        {
          boundingClientRect: new DOMRect(),
          intersectionRatio: 1,
          intersectionRect: new DOMRect(),
          isIntersecting: true,
          rootBounds: null,
          target,
          time: 0,
        },
      ],
      new IntersectionObserver(callback),
    );
  }
}

/**
 * Sets the width every element is measured at, such as 375 for a phone.
 */
export function setViewportWidth(width: number): void {
  viewportWidth = width;
}
