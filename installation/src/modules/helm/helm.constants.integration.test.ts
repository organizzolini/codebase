import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { HELM_VERSION } from "./helm.constants";

const DEVCONTAINERS = ["local", "cloud"];

describe("helm constants", () => {
  // The two installs must not drift: Homebrew-free Linux uses this pin, the
  // devcontainer feature uses its own.
  it.each(DEVCONTAINERS)(
    "pins the version the %s devcontainer installs",
    (name) => {
      const file = path.resolve(
        import.meta.dirname,
        `../../../../.devcontainer/${name}/devcontainer.json`,
      );
      const pinned = /"helm":\s*"([^"]+)"/u.exec(readFileSync(file, "utf8"));

      expect(`v${pinned?.[1] ?? ""}`).toBe(HELM_VERSION);
    },
  );
});
