import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

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

/**
 * Input fixture files, keyed by path relative to the tree root.
 *
 * Written to disk: only a glob can name a build directory.
 */
export const INPUT_FIXTURE_FILES: Readonly<Record<string, string>> = {
  ".hidden/secret.js": "export const secret = 1;\n",
  "dist/index.js": createGeneratedSource(128),
  "dist/nested/deep.js": "export const deep = 1;\n",
  "dist/nested/deep.min.js": "export const deep=1;\n",
  "dist/notes.md": "# Built\n",
  "dist/vendor/bundled.js": "export const bundled = 1;\n",
  "other/index.js": "export const other = 1;\n",
};

/**
 * Writes the input fixture tree into an empty directory, with a looping symlink and a broken one.
 */
export function createInputTree(root: string): string {
  for (const [relativePath, contents] of Object.entries(INPUT_FIXTURE_FILES)) {
    const absolutePath = path.join(root, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, contents);
  }

  symlinkSync(
    path.join(root, "dist/nested/deep.js"),
    path.join(root, "dist/link.js"),
  );
  symlinkSync(path.join(root, "dist"), path.join(root, "dist/loop"));
  symlinkSync(
    path.join(root, "dist/missing.js"),
    path.join(root, "dist/broken.js"),
  );

  return root;
}
