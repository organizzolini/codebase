import { describe, expect, it } from "vitest";

import {
  currentVersion,
  nextVersion,
  withRequiredVersion,
  withToolVersions,
} from "./upgrade-python.utilities";

const PYPROJECT = `[project]
name = "example"
requires-python = ">=3.15,<3.16"
`;
const TOOLS = `[tool.ruff]
target-version = "py315"

[tool.pyright]
pythonVersion = "3.15"
`;

describe("upgrade-python utilities", () => {
  describe(currentVersion, () => {
    it("reads the minimum the pyproject requires", () => {
      expect.hasAssertions();
      expect(currentVersion(PYPROJECT)).toBe("3.15");
    });

    it("refuses a pyproject without one", () => {
      expect.hasAssertions();
      expect(() => currentVersion('[project]\nname = "x"\n')).toThrow(
        "requires-python",
      );
    });
  });

  describe(nextVersion, () => {
    it("counts minor versions as numbers, not text", () => {
      expect.hasAssertions();
      expect(nextVersion("3.9")).toBe("3.10");
      expect(nextVersion("3.14")).toBe("3.15");
    });
  });

  describe(withRequiredVersion, () => {
    it("allows exactly the given minor and nothing else", () => {
      expect.hasAssertions();
      expect(withRequiredVersion(PYPROJECT, "3.16")).toBe(
        PYPROJECT.replace(">=3.15,<3.16", ">=3.16,<3.17"),
      );
    });
  });

  describe(withToolVersions, () => {
    it("aims ruff and pyright at the given minor", () => {
      expect.hasAssertions();
      expect(withToolVersions(TOOLS, "3.16")).toBe(
        TOOLS.replace("py315", "py316").replace('"3.15"', '"3.16"'),
      );
    });
  });
});
