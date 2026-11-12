import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createFixtureTarball } from "../../../testing/tarball-fixture";
import { useTemporaryDirectory } from "../temporary-directory/temporary-directory.utilities";

import { startVerdaccioPluginRunner } from "./nx-plugin-sandbox.utilities";

import type { VerdaccioPluginRunner } from "./nx-plugin-sandbox.types";

// 🧪 Tests

describe(startVerdaccioPluginRunner, () => {
  let runner: VerdaccioPluginRunner;
  const root = useTemporaryDirectory("plugin-workspace");

  beforeAll(async () => {
    const workspaceRoot = root();
    const tarballs = path.join(workspaceRoot, "dist", "tarballs");
    fs.mkdirSync(tarballs, { recursive: true });
    await createFixtureTarball(tarballs, {
      bin: "nx",
      name: "@fixture/nx",
      version: "1.0.0",
    });
    await createFixtureTarball(tarballs, {
      name: "@fixture/plugin",
      version: "3.0.0",
    });
    await createFixtureTarball(tarballs, {
      name: "fixture-unscoped",
      version: "1.0.0",
    });
    await createFixtureTarball(tarballs, {
      name: "@fixture/pinned",
      publishConfig: { registry: "http://127.0.0.1:1/" },
      version: "2.0.0",
    });

    runner = await startVerdaccioPluginRunner({
      localScopes: ["@fixture"],
      tag: "e2e-test",
    });
  }, 60_000);

  afterAll(async () => {
    await runner.stop();
  });

  describe("the registry", () => {
    it("serves a registry on its own free port", async () => {
      const response = await fetch(`${runner.registryUrl}-/ping`);

      expect(response.ok).toBe(true);
      expect(runner.registryUrl).toContain(`:${runner.port}/`);
    });

    it("publishes tarballs under the test tag without touching their manifests", async () => {
      await runner.publish({
        packages: ["@fixture/nx", "@fixture/plugin"],
        workspaceRoot: root(),
      });
      const response = await fetch(`${runner.registryUrl}@fixture/plugin`);
      const metadata = (await response.json()) as {
        "dist-tags": Record<string, string>;
      };

      expect(metadata["dist-tags"]).toMatchObject({ "e2e-test": "3.0.0" });
    }, 60_000);

    it("keeps a package whose manifest names another registry in the sandbox", async () => {
      await runner.publish({
        packages: ["@fixture/pinned"],
        workspaceRoot: root(),
      });
      const response = await fetch(`${runner.registryUrl}@fixture/pinned`);
      const metadata = (await response.json()) as {
        "dist-tags": Record<string, string>;
      };

      expect(metadata["dist-tags"]).toMatchObject({ "e2e-test": "2.0.0" });
    }, 60_000);

    it("publishes a package that has no scope", async () => {
      await runner.publish({
        packages: ["fixture-unscoped"],
        workspaceRoot: root(),
      });
      const response = await fetch(`${runner.registryUrl}fixture-unscoped`);
      const metadata = (await response.json()) as {
        "dist-tags": Record<string, string>;
      };

      expect(metadata["dist-tags"]).toMatchObject({ "e2e-test": "1.0.0" });
    }, 60_000);

    it("refuses to publish a version the registry already has", async () => {
      await expect(
        runner.publish({
          packages: ["@fixture/plugin"],
          workspaceRoot: root(),
        }),
      ).rejects.toThrow(/npm publish failed/u);
    }, 60_000);
  });

  describe("a consumer workspace", () => {
    it("bootstraps a consumer workspace that installs from the registry by tag", async () => {
      const workspace = await runner.createWorkspace({
        packages: ["@fixture/nx", "@fixture/plugin"],
      });
      const manifest = JSON.parse(
        fs.readFileSync(path.join(workspace.directory, "package.json"), "utf8"),
      ) as { devDependencies: Record<string, string> };

      expect(manifest.devDependencies).toStrictEqual({
        "@fixture/nx": "e2e-test",
        "@fixture/plugin": "e2e-test",
      });
      expect(
        fs.existsSync(
          path.join(workspace.directory, "node_modules", "@fixture", "plugin"),
        ),
      ).toBe(true);
    }, 60_000);

    it("registers plugins in nx.json once, with or without options", async () => {
      const workspace = await runner.createWorkspace({ packages: [] });

      workspace.registerPlugin("@fixture/plugin");
      workspace.registerPlugin("@fixture/plugin");
      workspace.registerPlugin("@fixture/other", { target: "gate" });
      const nxJson = JSON.parse(
        fs.readFileSync(path.join(workspace.directory, "nx.json"), "utf8"),
      ) as { plugins: unknown[] };

      expect(nxJson.plugins).toStrictEqual([
        "@fixture/plugin",
        { options: { target: "gate" }, plugin: "@fixture/other" },
      ]);
    }, 60_000);

    it("runs generators and targets through the installed nx", async () => {
      const workspace = await runner.createWorkspace({
        packages: ["@fixture/nx"],
      });

      const generated = await workspace.generate("@fixture/plugin:init", [
        "--name=demo",
      ]);
      const gated = await workspace.runTarget("demo:gate", ["--verbose"]);

      expect(generated).toMatchObject({
        exitCode: 0,
        stdout: "nx generate @fixture/plugin:init --name=demo",
      });
      expect(gated.stdout).toBe("nx run demo:gate --verbose");
    }, 60_000);
  });

  it("closes the registry again when it cannot sign up its user", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("no", { status: 503 }),
    );

    await expect(startVerdaccioPluginRunner()).rejects.toThrow(
      /refused to sign up/u,
    );
  });

  it("stops serving once stopped", async () => {
    const second = await startVerdaccioPluginRunner();
    await second.stop();

    await expect(fetch(`${second.registryUrl}-/ping`)).rejects.toThrow(
      /fetch failed/u,
    );
  }, 60_000);
});
