import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { PackageManifestService } from "../package-manifest/package-manifest.service";

import { UpgradeNodeService } from "./upgrade-node.service";

/** Makes `fetch` answer with the given versions, as nodejs.org lists them. */
const releasesAre = (...versions: string[]): void => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json(versions.map((version) => ({ version }))),
      ),
  );
};

describe(UpgradeNodeService, () => {
  let service: UpgradeNodeService;
  let packageManifest: PackageManifestService;
  let directory: string;
  let originalDirectory: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpgradeNodeService,
        {
          provide: PackageManifestService,
          useValue: createMock<PackageManifestService>(),
        },
      ],
    }).compile();

    service = await module.resolve(UpgradeNodeService);
    packageManifest = await module.resolve(PackageManifestService);
  });

  beforeEach(() => {
    originalDirectory = process.cwd();
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "node-test-"));
    process.chdir(directory);
    fs.writeFileSync(".nvmrc", "v24.16.0\n");
    vi.mocked(packageManifest.replace).mockReset();
  });

  afterEach(() => {
    process.chdir(originalDirectory);
    vi.unstubAllGlobals();
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("writes the newest release of the major, in both places", async () => {
    expect.hasAssertions();

    releasesAre("v25.1.0", "v24.9.0", "v24.17.2", "v24.16.0", "v22.20.0");

    await expect(service.upgrade()).resolves.toBe("node v24.17.2");
    expect(fs.readFileSync(".nvmrc", "utf8")).toBe("v24.17.2\n");
    expect(packageManifest.replace).toHaveBeenCalledWith(
      "engines.node",
      ">=24.17.2",
    );
  });

  it("changes nothing when the newest release is the one in use", async () => {
    expect.hasAssertions();

    releasesAre("v24.16.0", "v24.9.0");

    await expect(service.upgrade()).resolves.toContain("already the newest");
    expect(fs.readFileSync(".nvmrc", "utf8")).toBe("v24.16.0\n");
    expect(packageManifest.replace).not.toHaveBeenCalled();
  });

  it("never goes back to an older release", async () => {
    expect.hasAssertions();

    releasesAre("v24.15.0");

    await expect(service.upgrade()).resolves.toContain("already the newest");
    expect(fs.readFileSync(".nvmrc", "utf8")).toBe("v24.16.0\n");
  });

  it("refuses a file that is not a version", async () => {
    expect.hasAssertions();

    fs.writeFileSync(".nvmrc", "lts/*\n");

    await expect(service.upgrade()).rejects.toThrow("not a version");
  });

  it("refuses an index with no release of the major", async () => {
    expect.hasAssertions();

    releasesAre("v22.20.0");

    await expect(service.upgrade()).rejects.toThrow("no release of 24.x");
  });

  it("refuses an answer that is not OK", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("down", { status: 503 })),
    );

    await expect(service.upgrade()).rejects.toThrow("HTTP 503");
  });
});
