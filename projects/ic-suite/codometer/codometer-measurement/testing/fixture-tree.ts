import { symlinkSync } from "node:fs";
import path from "node:path";

import { writeFileTree } from "@codebase/testing";

/** Fixture files by relative path, on real disk under test. */
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
 * Writes the fixture tree into a directory and returns that root. `CLAUDE.md`
 * is a symlink to `AGENTS.md`, like the repository's own tree.
 */
export function createFixtureTree(root: string): string {
  writeFileTree(root, FIXTURE_FILES);
  symlinkSync(path.join(root, "AGENTS.md"), path.join(root, "CLAUDE.md"));

  return root;
}
