import { DESKTOP_QUERY, WIDE_QUERY } from "./calendar-viewport.constants";

/**
 * Whether the page is at least as wide as a desktop, read synchronously.
 */
export function isDesktopViewport(): boolean {
  return globalThis.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * Whether the page is at least as wide as a tablet, read synchronously so the
 * first render already knows, rather than a frame later.
 */
export function isWideViewport(): boolean {
  return globalThis.matchMedia(WIDE_QUERY).matches;
}

/**
 * Calls back whenever the page crosses the desktop width, and returns how to
 * stop, in the shape `useSyncExternalStore` subscribes with.
 */
export function subscribeToDesktopViewport(onChange: () => void): () => void {
  return subscribeToQuery(DESKTOP_QUERY, onChange);
}

/**
 * Calls back whenever the page crosses the tablet width, and returns how to
 * stop, in the shape `useSyncExternalStore` subscribes with.
 */
export function subscribeToViewport(onChange: () => void): () => void {
  return subscribeToQuery(WIDE_QUERY, onChange);
}

/**
 * Watches a media query, returning how to stop.
 */
function subscribeToQuery(query: string, onChange: () => void): () => void {
  const list = globalThis.matchMedia(query);

  list.addEventListener("change", onChange);

  return () => {
    list.removeEventListener("change", onChange);
  };
}
