// jsdom has no layout and no `matchMedia`, so the media queries the page
// asks are answered against a width a test sets, wide like a desktop by
// default.

const DESKTOP_WIDTH = 1280;

let viewportWidth = DESKTOP_WIDTH;

// Every query a listener watches, so a width a test sets mid-render reaches
// the page the way a resized window would.
const listeners = new Set<{
  listener: EventListenerOrEventListenerObject;
  query: string;
}>();

/**
 * Answers `matchMedia` for the current test width, understanding the
 * `min-width` and `max-width` features in pixels that the page uses.
 */
export function installViewport(): void {
  viewportWidth = DESKTOP_WIDTH;
  listeners.clear();

  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        listeners.add({ listener, query });
      },
      addListener: () => {},
      dispatchEvent: () => false,
      matches: matchesWidth(query),
      media: query,
      onchange: null,
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        for (const entry of listeners) {
          if (entry.listener === listener) {
            listeners.delete(entry);
          }
        }
      },
      removeListener: () => {},
    }),
  });
}

/**
 * Sets the width media queries see, such as 375 for a phone or 800 for a
 * tablet, telling each listener whose query the change flips.
 */
export function setViewportWidth(width: number): void {
  const before = [...listeners].map((entry) => ({
    ...entry,
    matched: matchesWidth(entry.query),
  }));

  viewportWidth = width;

  const flipped = before.filter(
    ({ matched, query }) => matched !== matchesWidth(query),
  );

  for (const { listener, query } of flipped) {
    const event = Object.assign(new Event("change"), {
      matches: matchesWidth(query),
    });

    if (typeof listener === "function") {
      listener(event);
    } else {
      listener.handleEvent(event);
    }
  }
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
