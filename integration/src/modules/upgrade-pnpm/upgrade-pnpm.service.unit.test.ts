import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PackageManifestService } from "../package-manifest/package-manifest.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { UpgradePnpmService } from "./upgrade-pnpm.service";

describe(UpgradePnpmService, () => {
  let service: UpgradePnpmService;
  let packageManifest: PackageManifestService;
  let processRunner: ProcessRunnerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpgradePnpmService,
        {
          provide: PackageManifestService,
          useValue: createMock<PackageManifestService>(),
        },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(UpgradePnpmService);
    packageManifest = await module.resolve(PackageManifestService);
    processRunner = await module.resolve(ProcessRunnerService);
  });

  beforeEach(() => {
    vi.mocked(packageManifest.replace).mockReset();
    vi.mocked(processRunner.capture).mockReset();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("pins the newest release once pnpm will switch to it", () => {
    expect.hasAssertions();

    vi.mocked(processRunner.capture)
      .mockReturnValueOnce({ status: 0, stderr: "", stdout: "12.15.0\n" })
      .mockReturnValueOnce({ status: 0, stderr: "", stdout: "12.15.0\n" });

    expect(service.upgrade()).toBe("pnpm 12.15.0");
    expect(packageManifest.replace).toHaveBeenCalledWith(
      "packageManager",
      "pnpm@12.15.0",
    );
  });

  it("throws when the newest release cannot be found", () => {
    expect.hasAssertions();

    vi.mocked(processRunner.capture).mockReturnValueOnce({
      status: 1,
      stderr: "offline",
      stdout: "",
    });

    expect(() => service.upgrade()).toThrow("offline");
    expect(packageManifest.replace).not.toHaveBeenCalled();
  });

  it("throws when what it printed is not a version", () => {
    expect.hasAssertions();

    vi.mocked(processRunner.capture).mockReturnValueOnce({
      status: 0,
      stderr: "",
      stdout: "not a version",
    });

    expect(() => service.upgrade()).toThrow("not a version");
  });

  it("throws when pnpm will not switch to the release", () => {
    expect.hasAssertions();

    vi.mocked(processRunner.capture)
      .mockReturnValueOnce({ status: 0, stderr: "", stdout: "12.15.0" })
      .mockReturnValueOnce({ status: 1, stderr: "too new", stdout: "" });

    expect(() => service.upgrade()).toThrow("too new");
  });
});
