import { beforeEach, describe, expect, it } from "vitest";

import { overrideEnvironment } from "./environment.utilities";

// 🧪 Tests

const PRESENT = "CODEBASE_TESTING_PRESENT";
const ABSENT = "CODEBASE_TESTING_ABSENT";

describe(overrideEnvironment, () => {
  process.env[PRESENT] = "original";
  Reflect.deleteProperty(process.env, ABSENT);

  it("sets each variable it is given", () => {
    overrideEnvironment({ [ABSENT]: "added", [PRESENT]: "changed" });

    expect(process.env[PRESENT]).toBe("changed");
    expect(process.env[ABSENT]).toBe("added");
  });

  it("restores every variable once the test finishes, removing ones that were absent", () => {
    expect(process.env[PRESENT]).toBe("original");
    expect(ABSENT in process.env).toBe(false);
  });

  it("removes a variable given as undefined", () => {
    overrideEnvironment({ [PRESENT]: undefined });

    expect(PRESENT in process.env).toBe(false);
  });

  it("brings a removed variable back afterwards", () => {
    expect(process.env[PRESENT]).toBe("original");
  });

  it("restores the value from before the first override when one variable is overridden twice", () => {
    overrideEnvironment({ [PRESENT]: "once" });
    overrideEnvironment({ [PRESENT]: "twice" });

    expect(process.env[PRESENT]).toBe("twice");
  });

  it("is back to the original after a double override", () => {
    expect(process.env[PRESENT]).toBe("original");
  });

  describe("from a beforeEach hook", () => {
    beforeEach(() => {
      overrideEnvironment({ [PRESENT]: "hooked" });
    });

    it("holds through the test", () => {
      expect(process.env[PRESENT]).toBe("hooked");
    });
  });

  it("is restored after a hook's override", () => {
    expect(process.env[PRESENT]).toBe("original");
  });
});
