/** Words the generated source cycles through to keep its symbols distinct. */
const SOURCE_WORDS = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "zeta",
  "eta",
  "theta",
] as const;

/**
 * Builds source whose gzip size depends on the deflate level, so a level left unstated fails the assertions.
 */
function createGeneratedSource(functionCount: number): string {
  const lines: string[] = [];

  for (let index = 0; index < functionCount; index++) {
    const word = SOURCE_WORDS[(index * 7) % SOURCE_WORDS.length] ?? "alpha";
    lines.push(
      `export function ${word}${index}(value) { return value * ${(index * 13) % 97}; }`,
    );
  }

  return `${lines.join("\n")}\n`;
}

/** Target fixture files by path, on disk for glob matching. */
export const TARGET_FIXTURE_FILES: Readonly<Record<string, string>> = {
  ".hidden/secret.js": "export const secret = 1;\n",
  "dist/index.js": createGeneratedSource(128),
  "dist/nested/deep.js": "export const deep = 1;\n",
  "dist/nested/deep.min.js": "export const deep=1;\n",
  "dist/notes.md": "# Built\n",
  "dist/vendor/bundled.js": "export const bundled = 1;\n",
  "other/index.js": "export const other = 1;\n",
};

/** Links the target tree holds: a link to a file, a loop to an ancestor, and a broken one. */
export const TARGET_FIXTURE_SYMLINKS: Readonly<Record<string, string>> = {
  "dist/broken.js": "dist/missing.js",
  "dist/link.js": "dist/nested/deep.js",
  "dist/loop": "dist",
};
