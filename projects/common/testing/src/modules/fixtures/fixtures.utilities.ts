import fs from "node:fs";

/**
 * Reads a fixture file as text by its path relative to the test file, which
 * passes its own `import.meta.url` as `base`.
 *
 * ```ts
 * const page = loadFixture(import.meta.url, "fixtures/page.html");
 * ```
 */
export function loadFixture(base: string | URL, relativePath: string): string {
  return fs.readFileSync(new URL(relativePath, base), "utf8");
}
