import fs from "node:fs";

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { PackageManifestService } from "./package-manifest.service";

const MANIFEST = `{
  "name": "example",
  "engines": { "node": ">=24.16.0", "vscode": "^1.22.0" },
  "packageManager": "pnpm@12.14.0",
  "files": ["a", "b"]
}
`;

describe(PackageManifestService, () => {
  let service: PackageManifestService;
  let directory: string;
  let originalDirectory: string;

  /** Reads the manifest of the scratch directory. */
  const read = (): string => fs.readFileSync("package.json", "utf8");

  beforeAll(async () => {
    const { module } = await buildTestingModule(PackageManifestService);

    service = await module.resolve(PackageManifestService);
  });

  beforeEach(() => {
    originalDirectory = process.cwd();
    directory = createTemporaryDirectory("manifest");
    process.chdir(directory);
    fs.writeFileSync("package.json", MANIFEST);
  });

  afterEach(() => {
    process.chdir(originalDirectory);
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(PackageManifestService);

    expect(instance).toBeInstanceOf(PackageManifestService);
  });

  it("replaces the package manager and returns the one it held", () => {
    expect.hasAssertions();
    expect(service.replace("packageManager", "pnpm@12.15.0")).toBe(
      "pnpm@12.14.0",
    );
    expect(read()).toBe(MANIFEST.replace("pnpm@12.14.0", "pnpm@12.15.0"));
  });

  it("replaces the node engine and leaves every other byte alone", () => {
    expect.hasAssertions();
    expect(service.replace("engines.node", ">=24.17.0")).toBe(">=24.16.0");
    expect(read()).toBe(MANIFEST.replace(">=24.16.0", ">=24.17.0"));
  });

  it("refuses a manifest that lacks the field", () => {
    expect.hasAssertions();

    fs.writeFileSync("package.json", '{"name": "example"}');

    expect(() => service.replace("packageManager", "pnpm@1.0.0")).toThrow(
      "packageManager",
    );
  });

  it("refuses a value written twice", () => {
    expect.hasAssertions();

    fs.writeFileSync(
      "package.json",
      `{"engines": {"node": ">=1.0.0"}, "packageManager": "x", "nested": {"packageManager": "x"}}`,
    );

    expect(() => service.replace("packageManager", "y")).toThrow("2 times");
  });
});
