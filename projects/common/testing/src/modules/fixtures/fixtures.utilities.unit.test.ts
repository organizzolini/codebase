import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "../temporary-directory/temporary-directory.utilities";

import { loadFixture } from "./fixtures.utilities";

// 🧪 Tests

describe(loadFixture, () => {
  it("reads a fixture by its path relative to the test file", () => {
    const directory = createTemporaryDirectory("fixtures");
    fs.mkdirSync(path.join(directory, "fixtures"));
    fs.writeFileSync(path.join(directory, "fixtures", "greeting.txt"), "salve");
    const testFile = pathToFileURL(path.join(directory, "sample.unit.test.ts"));

    expect(loadFixture(testFile.href, "fixtures/greeting.txt")).toBe("salve");
    expect(loadFixture(testFile, "./fixtures/greeting.txt")).toBe("salve");
  });

  it("reads a fixture beside this very test through import.meta.url", () => {
    expect(loadFixture(import.meta.url, "fixtures.utilities.ts")).toContain(
      "export function loadFixture",
    );
  });

  it("throws for a fixture that does not exist", () => {
    expect(() => loadFixture(import.meta.url, "missing.txt")).toThrow(
      /ENOENT/u,
    );
  });
});
