import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { HELM_VERSION } from "./helm.constants";
import { HelmService } from "./helm.service";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { ProcessOptions } from "../process-runner/process-runner.types";

const ARCHIVE = `helm-${HELM_VERSION}-linux-amd64.tar.gz`;
const TEMPORARY = "/tmp/helm-fixture";
const BINARY_DIRECTORY = path.join(os.homedir(), ".local", "bin");

/** Builds the service over a fake machine and returns it with the account the fake kept. */
async function build(machine: FakeMachine = {}): Promise<{
  commands: string[];
  options: Map<string, ProcessOptions>;
  reporter: ReporterService;
  service: HelmService;
}> {
  const { commands, options, runner } = createFakeProcessRunner({
    ...machine,
    responses: {
      "mktemp -d": { stdout: `${TEMPORARY}\n` },
      ...machine.responses,
    },
  });
  const reporter = createMock<ReporterService>();
  const module = await Test.createTestingModule({
    providers: [
      HelmService,
      { provide: ProcessRunnerService, useValue: runner },
      { provide: ReporterService, useValue: reporter },
      { provide: LoggerService, useValue: createMock<LoggerService>() },
    ],
  }).compile();

  return {
    commands,
    options,
    reporter,
    service: await module.resolve(HelmService),
  };
}

describe(HelmService, () => {
  let service: HelmService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HelmService,
        {
          provide: ProcessRunnerService,
          useValue: createFakeProcessRunner().runner,
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(HelmService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("leaves an installed helm alone", async () => {
    const { commands, service: installer } = await build({
      installed: ["helm"],
    });

    installer.installHelm();

    expect(commands).toStrictEqual([]);
  });

  it("downloads, verifies, and installs the pinned release", async () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("linux");
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { commands, service: installer } = await build();

    installer.installHelm();

    expect(commands).toStrictEqual([
      "mktemp -d",
      `curl -fsSL -o ${TEMPORARY}/${ARCHIVE} https://get.helm.sh/${ARCHIVE}`,
      `curl -fsSL -o ${TEMPORARY}/${ARCHIVE}.sha256sum https://get.helm.sh/${ARCHIVE}.sha256sum`,
      `sha256sum -c ${ARCHIVE}.sha256sum`,
      `tar -xzf ${ARCHIVE}`,
      `mkdir -p ${BINARY_DIRECTORY}`,
      `install -m 0755 ${TEMPORARY}/linux-amd64/helm ${BINARY_DIRECTORY}/helm`,
      `rm -rf ${TEMPORARY}`,
    ]);
  });

  // The archive is downloaded to a directory of its own, so the commands that
  // name it by its bare file name have to run there.
  it("runs the checksum and the unpacking in the download directory", async () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("linux");
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { options, service: installer } = await build();

    installer.installHelm();

    expect(options.get(`sha256sum -c ${ARCHIVE}.sha256sum`)?.cwd).toBe(
      TEMPORARY,
    );
    expect(options.get(`tar -xzf ${ARCHIVE}`)?.cwd).toBe(TEMPORARY);
  });

  it("uses the arm64 archive on an arm64 machine", async () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("linux");
    vi.spyOn(process, "arch", "get").mockReturnValue("arm64");
    const { commands, service: installer } = await build();

    installer.installHelm();

    expect(commands).toContain(
      `tar -xzf helm-${HELM_VERSION}-linux-arm64.tar.gz`,
    );
  });

  it("cleans up and fails when the checksum does not match", async () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("linux");
    vi.spyOn(process, "arch", "get").mockReturnValue("x64");
    const { commands, service: installer } = await build({
      responses: { [`sha256sum -c ${ARCHIVE}.sha256sum`]: { status: 1 } },
    });

    expect(() => {
      installer.installHelm();
    }).toThrow("sha256sum");
    expect(commands).toContain(`rm -rf ${TEMPORARY}`);
    expect(commands.join("\n")).not.toContain("install -m");
  });

  it("refuses a platform Helm's archive is not used on", async () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("darwin");
    const { commands, service: installer } = await build();

    expect(() => {
      installer.installHelm();
    }).toThrow("Linux only");
    expect(commands).toStrictEqual([]);
  });

  it("refuses an architecture Helm publishes no archive for", async () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("linux");
    vi.spyOn(process, "arch", "get").mockReturnValue("ia32");
    const { service: installer } = await build();

    expect(() => {
      installer.installHelm();
    }).toThrow("Linux only");
  });
});
