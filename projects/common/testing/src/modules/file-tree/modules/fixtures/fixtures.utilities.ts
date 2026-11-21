import fs from "node:fs";

/**
 * Reads a fixture as text, resolving `relativePath` against the test file's `import.meta.url`.
 */
export function loadFixture(base: string | URL, relativePath: string): string {
  return fs.readFileSync(new URL(relativePath, base), "utf8");
}
