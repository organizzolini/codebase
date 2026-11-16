import fs from "node:fs";
import fsPromises from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import {
  existsThroughDefault,
  readThroughNamed,
  readThroughPromises,
} from "../../../testing/fixtures/sample-file-reader";

import type * as FileSystemHelpers from "../../file-system";
import type * as NodeFileSystemPromises from "node:fs/promises";

// `vi.mock` hoists above static imports, so the factory imports the helper
// through `vi.importActual`. `node:fs` is a bare mock: no real function runs.
vi.mock("node:fs", async () => {
  const { mockFileSystem } =
    await vi.importActual<typeof FileSystemHelpers>("../../file-system");

  return mockFileSystem();
});

// `node:fs/promises` is a spying mock: each function runs for real until a
// test stages a result.
vi.mock("node:fs/promises", async (importOriginal) => {
  const { mockFileSystem } =
    await vi.importActual<typeof FileSystemHelpers>("../../file-system");

  return mockFileSystem(await importOriginal<typeof NodeFileSystemPromises>());
});

// 🧪 Tests

describe("mockFileSystem", () => {
  it("serves the default and the named export from the same stubs", () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(fs.readFileSync).mockReturnValueOnce("staged");

    expect(existsThroughDefault("/nowhere")).toBe(true);
    expect(readThroughNamed("/nowhere")).toBe("staged");
    expect(fs.existsSync).toHaveBeenCalledWith("/nowhere");
    expect(fs.readFileSync).toHaveBeenCalledWith("/nowhere", "utf8");
  });

  it("leaves a bare stub unstaged, with no real file read", () => {
    expect(existsThroughDefault("/etc/hosts")).toBeUndefined();
  });

  it("runs the real function over the real module until a result is staged", async () => {
    await expect(readThroughPromises(import.meta.filename)).resolves.toContain(
      "spying mock",
    );

    vi.mocked(fsPromises.readFile).mockResolvedValueOnce("staged");

    await expect(readThroughPromises(import.meta.filename)).resolves.toBe(
      "staged",
    );
  });
});
