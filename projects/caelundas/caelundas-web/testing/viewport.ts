// jsdom has no layout and no `matchMedia`, so the media queries the page
// asks are answered against a width a test sets, wide like a desktop by
// default.

const DESKTOP_WIDTH = 1280;

let viewportWidth = DESKTOP_WIDTH;

/**
 * Answers `matchMedia` for the current test width, understanding the
 * `min-width` and `max-width` features in pixels that the page uses.
 */
export function installViewport(): void {
  viewportWidth = DESKTOP_WIDTH;

  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: matchesWidth(query),
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }),
  });
}

/**
 * Sets the width the next render's media queries see, such as 375 for a
 * phone or 800 for a tablet.
 */
export function setViewportWidth(width: number): void {
  viewportWidth = width;
}

/**
 * Whether every width feature in a query holds at the current width.
 */
function matchesWidth(query: string): boolean {
  // Every width the page asks about is in pixels, so the unit is not read.
  const features = query.matchAll(/\((min|max)-width:\s*(\d+)/gu);

  return [...features].every(([, bound, pixels]) =>
    bound === "min"
      ? viewportWidth >= Number(pixels)
      : viewportWidth <= Number(pixels),
  );
}
