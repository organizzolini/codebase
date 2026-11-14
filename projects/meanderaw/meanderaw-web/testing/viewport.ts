// jsdom lays nothing out, so every element is as wide as the viewport a test
// sets and as tall as one row of cards, and the window is as tall as a phone.

const DESKTOP_WIDTH = 1280;

/** How tall jsdom says every element is, in pixels. */
export const ELEMENT_HEIGHT = 300;

let viewportWidth = DESKTOP_WIDTH;

/**
 * Answers every element's size from the viewport a test sets, and tells each
 * watching resize observer the size of what it starts to watch.
 */
export function installViewport(): void {
  viewportWidth = DESKTOP_WIDTH;
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
}

/**
 * Scrolls the window to a distance from the top, telling every scroll listener.
 */
export function scrollWindowTo(top: number): void {
  Object.defineProperty(globalThis, "scrollY", {
    configurable: true,
    value: top,
  });
  globalThis.dispatchEvent(new Event("scroll"));
}

/**
 * Sets the width every element is measured at, such as 375 for a phone.
 */
export function setViewportWidth(width: number): void {
  viewportWidth = width;
}
