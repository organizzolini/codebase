import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** Fixture files by root-relative path, written to disk, not mocked. */
const FIXTURE_FILES: Readonly<Record<string, string>> = {
  // `README.md` is not named here on purpose. Codometer splices into it, so
  // it excludes it from what it measures without being told.
  ".codometerignore": ["vendor/", ""].join("\n"),
  ".gitignore": ["build/", "*.log", "nested/generated/", ""].join("\n"),
  "AGENTS.md": "# Agents\n",
  "build/output.js": "export const built = 1;\n",
  "debug.log": "noise\n",
  "nested/.gitignore": ["*.md", "!keep.md", ""].join("\n"),
  "nested/deep/deeper.ts": "export const deeper = 1;\n",
  "nested/drop.md": "# Drop\n",
  "nested/generated/thing.ts": "export const generated = 1;\n",
  "nested/keep.md": "# Keep\n",
  "node_modules/library/index.ts": "export const library = 1;\n",
  "README.md":
    "# Readme\n\n<!-- codometer:start -->\n\nold\n<!-- codometer:end -->\n",
  "redistribute/index.ts": "export const redistributed = 1;\n",
  "src/app.ts": "export const app = 1;\n",
  "src/app.unit.test.ts": "export const appTest = 1;\n",
  "src/data.json": '{ "name": "fixture" }\n',
  "src/main.tf": 'variable "name" {}\n',
  "src/notebook.ipynb": '{ "cells": [], "nbformat": 4, "nbformat_minor": 5 }\n',
  "src/query.sql": "select 1;\n",
  "src/script.sh": "echo hello\n",
  "src/settings.toml": 'name = "fixture"\n',
  "src/styles.css": ".a { color: red; }\n",
  "src/utility.js": "export const utility = 1;\n",
  "src/values.yaml": "name: fixture\n",
  "vendor/vendored.ts": "export const vendored = 1;\n",
};

/**
 * Writes the fixture tree under `parentDirectory` (default: the temporary directory) and returns its root. Every caller owes a `removeFixtureTree`.
 */
export function createFixtureTree(parentDirectory: string = tmpdir()): string {
  const root = mkdtempSync(path.join(parentDirectory, "codometer-fixture-"));

  for (const [relativePath, contents] of Object.entries(FIXTURE_FILES)) {
    const absolutePath = path.join(root, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, contents);
  }

  symlinkSync(path.join(root, "AGENTS.md"), path.join(root, "CLAUDE.md"));

  return root;
}

/** Removes a fixture tree, whether or not the suite that made it succeeded. */
export function removeFixtureTree(root: string): void {
  rmSync(root, { force: true, recursive: true });
}
