/**
 * Thrown when the browser lacks WebAssembly or Web Workers, which the events
 * database needs, so the page can say so instead of offering a retry that
 * cannot succeed.
 */
export class UnsupportedBrowserError extends Error {
  constructor() {
    super("This browser does not support WebAssembly and Web Workers");
  }

  override readonly name = "UnsupportedBrowserError";
}
