import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { ReleaseArchivesService } from "./release-archives.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { ReleaseArchiveTool } from "./release-archives.types";

const TEMPORARY = "/tmp/archive-fixture";
const BINARY_DIRECTORY = path.join(os.homedir(), ".local", "bin");
const HASH = "a".repeat(64);

const ARCHIVE_TOOL: ReleaseArchiveTool = {
  architectures: { arm64: "arm", x64: "x86" },
  archiveName: "demo_{version}_{architecture}.tar.gz",
  checksumUrl: "https://example.test/{version}/checksums.txt",
  downloadUrl:
    "https://example.test/{version}/demo_{version}_{architecture}.tar.gz",
  format: "tar.gz",
  members: ["demo-{architecture}/demo", "demo-{architecture}/demo-extra"],
  name: "demo",
  version: "1.2.3",
};

const ZIP_TOOL: ReleaseArchiveTool = {
  ...ARCHIVE_TOOL,
  archiveName: "demo.zip",
  downloadUrl: "https://example.test/demo.zip",
  format: "zip",
  members: ["demo"],
};

const BINARY_TOOL: ReleaseArchiveTool = {
  ...ARCHIVE_TOOL,
  archiveName: "demo",
  checksumUrl: "https://example.test/demo.sha256",
  downloadUrl: "https://example.test/demo",
  format: "binary",
  members: ["demo"],
};

/** Builds the service over a fake Linux machine that publishes the given checksums. */
async function build(
  listing: string,
  machine: FakeMachine = {},
): Promise<{
  commands: string[];
  options: Map<string, { cwd?: string }>;
  service: ReleaseArchivesService;
}> {
  const { commands, options, runner } = createFakeProcessRunner({
    platform: "linux",
    ...machine,
    responses: {
      [`sha256sum ${TEMPORARY}/demo.zip`]: { stdout: `${HASH}  x\n` },
      [`sha256sum ${TEMPORARY}/demo_1.2.3_x86.tar.gz`]: {
        stdout: `${HASH}  ${TEMPORARY}/demo_1.2.3_x86.tar.gz\n`,
      },
      [`sha256sum ${TEMPORARY}/demo`]: { stdout: `${HASH}  x\n` },
      "curl -fsSL https://example.test/1.2.3/checksums.txt": {
        stdout: listing,
      },
      "curl -fsSL https://example.test/demo.sha256": { stdout: listing },
      "mktemp -d": { stdout: `${TEMPORARY}\n` },
      ...machine.responses,
    },
  });
  const module = await Test.createTestingModule({
    providers: [
      ReleaseArchivesService,
      { provide: ProcessRunnerService, useValue: runner },
      { provide: ReporterService, useValue: createMock<ReporterService>() },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ],
  }).compile();

  return {
    commands,
    options,
    service: await module.resolve(ReleaseArchivesService),
  };
}

describe(ReleaseArchivesService, () => {
  let service: ReleaseArchivesService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReleaseArchivesService,
        {
          provide: ProcessRunnerService,
          useValue: createFakeProcessRunner().runner,
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(ReleaseArchivesService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("leaves an installed tool alone", async () => {
    const { commands, service: installer } = await build("", {
      installed: ["demo"],
    });

    installer.install(ARCHIVE_TOOL);

    expect(commands).toStrictEqual([]);
  });

  it("downloads, verifies, unpacks, and installs every executable", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const {
      commands,
      options,
      service: installer,
    } = await build(`0000  other.tar.gz\n${HASH}  demo_1.2.3_x86.tar.gz\n`);

    installer.install(ARCHIVE_TOOL);

    expect(commands).toStrictEqual([
      "mktemp -d",
      `curl -fsSL -o ${TEMPORARY}/demo_1.2.3_x86.tar.gz https://example.test/1.2.3/demo_1.2.3_x86.tar.gz`,
      "curl -fsSL https://example.test/1.2.3/checksums.txt",
      `sha256sum ${TEMPORARY}/demo_1.2.3_x86.tar.gz`,
      "tar -xzf demo_1.2.3_x86.tar.gz",
      `mkdir -p ${BINARY_DIRECTORY}`,
      `install -m 0755 ${TEMPORARY}/demo-x86/demo ${BINARY_DIRECTORY}/demo`,
      `install -m 0755 ${TEMPORARY}/demo-x86/demo-extra ${BINARY_DIRECTORY}/demo-extra`,
      `rm -rf ${TEMPORARY}`,
    ]);
    expect(options.get("tar -xzf demo_1.2.3_x86.tar.gz")?.cwd).toBe(TEMPORARY);
  });

  it("matches a checksum written with a binary-mode marker", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { commands, service: installer } = await build(
      `${HASH} *demo_1.2.3_x86.tar.gz\n`,
    );

    installer.install(ARCHIVE_TOOL);

    expect(commands).toContain(`rm -rf ${TEMPORARY}`);
  });

  it("unzips a zip archive", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const {
      commands,
      options,
      service: installer,
    } = await build(`${HASH}  demo.zip\n`);

    installer.install(ZIP_TOOL);

    expect(commands).toContain("unzip -q -o demo.zip");
    expect(options.get("unzip -q -o demo.zip")?.cwd).toBe(TEMPORARY);
  });

  it("installs a bare binary without unpacking it", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { commands, service: installer } = await build(HASH);

    installer.install(BINARY_TOOL);

    expect(commands.join("\n")).not.toMatch(/tar |unzip /u);
    expect(commands).toContain(
      `install -m 0755 ${TEMPORARY}/demo ${BINARY_DIRECTORY}/demo`,
    );
  });

  it("cleans up and installs nothing when the checksum does not match", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { commands, service: installer } = await build(
      `${"b".repeat(64)}  demo_1.2.3_x86.tar.gz\n`,
    );

    expect(() => {
      installer.install(ARCHIVE_TOOL);
    }).toThrow("does not match its published checksum");
    expect(commands).toContain(`rm -rf ${TEMPORARY}`);
    expect(commands.join("\n")).not.toContain("install -m");
  });

  it("fails when no checksum is published for the archive", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { service: installer } = await build("0000  other.tar.gz\n\n");

    expect(() => {
      installer.install(ARCHIVE_TOOL);
    }).toThrow("No checksum is published");
  });

  it("refuses a platform the archives are not for", async () => {
    const { commands, service: installer } = await build("", {
      platform: "darwin",
    });

    expect(() => {
      installer.install(ARCHIVE_TOOL);
    }).toThrow("Linux only");
    expect(commands).toStrictEqual([]);
  });

  it("refuses an architecture the tool publishes nothing for", async () => {
    vi.spyOn(process, "arch", "get").mockReturnValue("ia32");
    const { service: installer } = await build("");

    expect(() => {
      installer.install(ARCHIVE_TOOL);
    }).toThrow("Linux only");
  });
});
