import { beforeEach, describe, expect, it } from "vitest";

import { useWorkingDirectory } from "./working-directory.utilities";

// 🧪 Tests

const original = process.cwd();

describe(useWorkingDirectory, () => {
  it("makes process.cwd return the directory, even one that does not exist", () => {
    useWorkingDirectory("/somewhere/else/entirely");

    expect(process.cwd()).toBe("/somewhere/else/entirely");
  });

  it("restores the real working directory once the test finishes", () => {
    expect(process.cwd()).toBe(original);
  });

  it("lets a later call replace an earlier one", () => {
    useWorkingDirectory("/first");
    useWorkingDirectory("/second");

    expect(process.cwd()).toBe("/second");
  });

  it("is back to the real directory after a double call", () => {
    expect(process.cwd()).toBe(original);
  });

  describe("from a beforeEach hook", () => {
    beforeEach(() => {
      useWorkingDirectory("/hooked");
    });

    it("holds through the test", () => {
      expect(process.cwd()).toBe("/hooked");
    });
  });

  it("is restored after a hook's call", () => {
    expect(process.cwd()).toBe(original);
  });
});
