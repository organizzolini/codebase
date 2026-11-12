import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createFixtureTarball } from "../../../testing/tarball-fixture";
import { createTemporaryDirectory } from "../temporary-directory/temporary-directory.utilities";

import {
  createTarballSandboxRunner,
  findTarballs,
} from "./tarball-sandbox.utilities";

import type { TarballSandboxRunner } from "./tarball-sandbox.types";

// 🧪 Tests

describe("tarball sandbox", () => {
  describe(findTarballs, () => {
    it("finds each package's newest tarball, flattening a scope", async () => {
      const directory = createTemporaryDirectory("tarballs");
      await createFixtureTarball(directory, { name: "tool", version: "1.0.0" });
      const newest = await createFixtureTarball(directory, {
        name: "tool",
        version: "1.1.0",
      });
      fs.utimesSync(newest, new Date(), new Date(Date.now() + 5000));
      const scoped = await createFixtureTarball(directory, {
        name: "@scope/tool-nx",
        version: "1.0.0",
      });

      expect(findTarballs(directory, ["tool", "@scope/tool-nx"])).toStrictEqual(
        [newest, scoped],
      );
    });

    it("treats a directory that does not exist as having no tarballs", () => {
      expect(() => findTarballs("/no/such/tarballs", ["tool"])).toThrow(
        /No tarball for "tool"/u,
      );
    });

    it("names the package and the pack target when a tarball is missing", async () => {
      const directory = createTemporaryDirectory("empty-tarballs");
      await createFixtureTarball(directory, {
        name: "tool-nx",
        version: "1.0.0",
      });

      expect(() => findTarballs(directory, ["tool"])).toThrow(
        /No tarball for "tool".*pack/u,
      );
    });
  });

  describe(createTarballSandboxRunner, () => {
    let runner: TarballSandboxRunner | undefined;

    afterEach(() => {
      runner?.dispose();
      runner = undefined;
    });

    it("installs the tarballs, including a closure that resolves between them", async () => {
      const workspaceRoot = createTemporaryDirectory("workspace");
      const tarballs = path.join(workspaceRoot, "dist", "tarballs");
      fs.mkdirSync(tarballs, { recursive: true });
      await createFixtureTarball(tarballs, {
        bin: "hello",
        dependencies: { "@fixture/lib": "1.0.0" },
        name: "hello-cli",
        version: "2.0.0",
      });
      await createFixtureTarball(tarballs, {
        name: "@fixture/lib",
        version: "1.0.0",
      });

      runner = await createTarballSandboxRunner({
        packages: ["hello-cli", "@fixture/lib"],
        workspaceRoot,
      });
      const result = await runner.command("hello", ["world"]).run();

      expect(result).toMatchObject({ exitCode: 0, stdout: "hello world" });
      expect(
        fs.existsSync(
          path.join(runner.directory, "node_modules", "@fixture", "lib"),
        ),
      ).toBe(true);
      expect(runner.tarballs).toHaveLength(2);
    });

    it("removes the sandbox on dispose", async () => {
      const directory = createTemporaryDirectory("only-tarballs");
      await createFixtureTarball(directory, { name: "solo", version: "1.0.0" });

      const sandbox = await createTarballSandboxRunner({
        packages: ["solo"],
        tarballDirectory: directory,
        workspaceRoot: directory,
      });
      sandbox.dispose();

      expect(fs.existsSync(sandbox.directory)).toBe(false);
    });

    it("reports an install that fails and leaves no sandbox behind", async () => {
      const directory = createTemporaryDirectory("failing-install");
      await createFixtureTarball(directory, {
        dependencies: { missing: "file:/does/not/exist.tgz" },
        name: "needy",
        version: "1.0.0",
      });

      await expect(
        createTarballSandboxRunner({
          packages: ["needy"],
          tarballDirectory: directory,
          workspaceRoot: directory,
        }),
      ).rejects.toThrow(/pnpm install failed/u);
    }, 60_000);

    it("reports an unreadable tarball and leaves no sandbox behind", async () => {
      const directory = createTemporaryDirectory("broken-tarball");
      fs.writeFileSync(path.join(directory, "broken-1.0.0.tgz"), "not a tar");

      await expect(
        createTarballSandboxRunner({
          packages: ["broken"],
          tarballDirectory: directory,
          workspaceRoot: directory,
        }),
      ).rejects.toThrow(/broken-1\.0\.0\.tgz/u);
    });
  });
});
