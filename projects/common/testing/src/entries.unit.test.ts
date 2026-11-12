import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// 🧪 Tests

/** Every non-test source file under a directory, relative to `src`. */
function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return sourceFiles(full);
    }

    return /\.tsx?$/u.test(entry.name) && !/\.test\.tsx?$/u.test(entry.name)
      ? [path.relative(import.meta.dirname, full)]
      : [];
  });
}

describe("entries", () => {
  it("keep execa and Verdaccio out of every entry but end-to-end", () => {
    const importers = sourceFiles(import.meta.dirname).filter((file) =>
      /\bexeca\b|"verdaccio"/u.test(
        fs.readFileSync(path.join(import.meta.dirname, file), "utf8"),
      ),
    );

    expect(importers.toSorted()).toStrictEqual([
      path.join("modules", "command", "command.utilities.ts"),
      path.join(
        "modules",
        "nx-plugin-sandbox",
        "nx-plugin-sandbox.utilities.ts",
      ),
    ]);
  });
});
