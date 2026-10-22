// A tablet's width is where the toolbar has room for a button per view and
// the week fits without scrolling sideways; anything narrower is a phone.
const WIDE_QUERY = "(min-width: 768px)";

/**
 * Whether the page is at least as wide as a tablet, read synchronously so the
 * first render already knows, rather than a frame later.
 */
export function isWideViewport(): boolean {
  return globalThis.matchMedia(WIDE_QUERY).matches;
}

/**
 * Calls back whenever the page crosses the tablet width, and returns how to
 * stop, in the shape `useSyncExternalStore` subscribes with.
 */
export function subscribeToViewport(onChange: () => void): () => void {
  const query = globalThis.matchMedia(WIDE_QUERY);

  query.addEventListener("change", onChange);

  return () => {
    query.removeEventListener("change", onChange);
  };
}
