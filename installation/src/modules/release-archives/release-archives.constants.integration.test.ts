import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { RELEASE_ARCHIVE_TOOLS } from "./release-archives.constants";

const DEVCONTAINER = readFileSync(
  path.resolve(
    import.meta.dirname,
    "../../../../.devcontainer/cloud/devcontainer.json",
  ),
  "utf8",
);

/** Where the cloud devcontainer pins each tool: a feature option, or an environment variable. */
const PINS: Record<string, RegExp> = {
  gitleaks: /"GITLEAKS_VERSION":\s*"([^"]+)"/u,
  helm: /kubectl-helm-minikube:1"\s*:\s*\{[^}]*?"helm":\s*"([^"]+)"/u,
  kubectl: /kubectl-helm-minikube:1"\s*:\s*\{[^}]*?"version":\s*"([^"]+)"/u,
  terraform: /features\/terraform:1"\s*:\s*\{[^}]*?"version":\s*"([^"]+)"/u,
  trivy: /"TRIVY_VERSION":\s*"([^"]+)"/u,
  uv: /"UV_VERSION":\s*"([^"]+)"/u,
};

describe("release archive tools", () => {
  // The two installs must not drift: Linux outside a devcontainer uses these
  // pins, the devcontainer uses its own.
  it.each(RELEASE_ARCHIVE_TOOLS)(
    "pins $name to the version the cloud devcontainer installs",
    (tool) => {
      const pinned = PINS[tool.name]?.exec(DEVCONTAINER);

      expect(pinned?.[1]).toBe(tool.version);
    },
  );
});
