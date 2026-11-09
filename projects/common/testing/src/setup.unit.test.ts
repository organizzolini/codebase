import fs from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { promptsMock } from "./modules/mocks/mocks.constants";

// 🧪 Tests

// The project's own `testing/setup.ts` loads `src/setup.ts`, so this file
// observes the shared setup exactly as a consuming project would.
describe("the shared Vitest setup", () => {
  const counter = vi.fn<() => void>();

  it("silences console logging behind spies", () => {
    console.log("hidden");
    console.warn("hidden");
    console.error("hidden");

    expect(vi.isMockFunction(console.log)).toBe(true);
    expect(console.log).toHaveBeenCalledWith("hidden");
    expect(console.warn).toHaveBeenCalledWith("hidden");
    expect(console.error).toHaveBeenCalledWith("hidden");
  });

  it("records a call in one test", () => {
    counter();

    expect(counter).toHaveBeenCalledTimes(1);
  });

  it("clears every mock's calls before the next test", () => {
    expect(counter).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it("survives a test that resets every mock", () => {
    vi.resetAllMocks();

    expect(promptsMock.getMockImplementation()).toBeUndefined();
  });

  it("answers an unanswered prompt as cancelled again in the next test", async () => {
    await expect(promptsMock({ name: "next" })).resolves.toStrictEqual({});
  });

  it("loads reflect-metadata, which Nest decorators need", () => {
    expect(typeof Reflect.getMetadata).toBe("function");
  });

  it("creates the output directory tests write into", () => {
    expect(fs.existsSync("./output")).toBe(true);
  });
});
