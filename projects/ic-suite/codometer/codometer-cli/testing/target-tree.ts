import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
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
 * Varied source, so the size pins the deflate level: a level left unstated fails the size assertions.
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
 * Target fixture files, keyed by path relative to the tree root.
 *
 * Written to disk: only a glob can name a build directory.
 */
export const TARGET_FIXTURE_FILES: Readonly<Record<string, string>> = {
  ".hidden/secret.js": "export const secret = 1;\n",
  "dist/index.js": createGeneratedSource(128),
  "dist/nested/deep.js": "export const deep = 1;\n",
  "dist/nested/deep.min.js": "export const deep=1;\n",
  "dist/notes.md": "# Built\n",
  "dist/vendor/bundled.js": "export const bundled = 1;\n",
  "other/index.js": "export const other = 1;\n",
};

/**
 * Writes the target fixture tree, including a symlink loop that must not be followed, to a temporary directory. Every caller must `removeTargetTree` it.
 */
export function createTargetTree(): string {
  const root = mkdtempSync(path.join(tmpdir(), "codometer-target-"));

  for (const [relativePath, contents] of Object.entries(TARGET_FIXTURE_FILES)) {
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

/** Removes a target fixture tree, whether or not the suite that made it passed. */
export function removeTargetTree(root: string): void {
  rmSync(root, { force: true, recursive: true });
}
