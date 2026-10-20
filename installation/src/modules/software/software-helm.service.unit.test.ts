import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareHelmService } from "./software-helm.service";
import {
  HELM_LINUX_AMD64_SHA256,
  HELM_RELEASE_URL,
} from "./software.constants";

import type { FakeMachine } from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const SCRATCH = "/tmp/helm-scratch";
const ARCHIVE = `${SCRATCH}/helm.tar.gz`;

describe(SoftwareHelmService, () => {
  let service: SoftwareHelmService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SoftwareHelmService,
        ReporterService,
        {
          provide: ProcessRunnerService,
          useValue: createFakeProcessRunner().runner,
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SoftwareHelmService);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    report = captureReport();
    enterWorkspace(workspace);
  });

  afterEach(() => {
    workspace.remove();
  });

  /** Builds the service over a Linux machine that answers the given way. */
  const createService = async (
    machine: FakeMachine = {},
  ): Promise<{ commands: string[]; subject: SoftwareHelmService }> => {
    const fake = createFakeProcessRunner({
      ...machine,
      platform: "linux",
      responses: {
        [`sha256sum ${ARCHIVE}`]: {
          stdout: `${HELM_LINUX_AMD64_SHA256}  ${ARCHIVE}\n`,
        },
        "mktemp -d": { stdout: `${SCRATCH}\n` },
        "uname -m": { stdout: "x86_64\n" },
        ...machine.responses,
      },
    });
    const module = await Test.createTestingModule({
      providers: [
        SoftwareHelmService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: fake.runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return {
      commands: fake.commands,
      subject: await module.resolve(SoftwareHelmService),
    };
  };

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("leaves an installed helm alone", async () => {
    expect.hasAssertions();

    const { commands, subject } = await createService({ installed: ["helm"] });

    subject.installHelmOnLinux();

    expect(commands).toStrictEqual([]);
    expect(report.join("\n")).toContain("helm is already installed.");
  });

  it("downloads, verifies, and installs the pinned release", async () => {
    expect.hasAssertions();

    const { commands, subject } = await createService();

    subject.installHelmOnLinux();

    expect(commands).toStrictEqual([
      "uname -m",
      "mktemp -d",
      `curl -fsSL -o ${ARCHIVE} ${HELM_RELEASE_URL}`,
      `sha256sum ${ARCHIVE}`,
      `tar -xzf ${ARCHIVE} -C ${SCRATCH}`,
      `mkdir -p ${path.join(workspace.home, ".local", "bin")}`,
      `install -m 755 ${SCRATCH}/linux-amd64/helm ${path.join(workspace.home, ".local", "bin", "helm")}`,
      `rm -rf ${SCRATCH}`,
    ]);
    expect(report.join("\n")).toContain("installed.");
  });

  it("installs nothing when the archive fails its checksum", async () => {
    expect.hasAssertions();

    const { commands, subject } = await createService({
      responses: {
        [`sha256sum ${ARCHIVE}`]: { stdout: `0000  ${ARCHIVE}\n` },
      },
    });

    subject.installHelmOnLinux();

    expect(commands.some((line) => line.startsWith("install "))).toBe(false);
    expect(commands).toContain(`rm -rf ${SCRATCH}`);
    expect(report.join("\n")).toContain("failed its checksum");
  });

  it("skips the install on a machine that is not 64-bit x86", async () => {
    expect.hasAssertions();

    const { commands, subject } = await createService({
      responses: { "uname -m": { stdout: "aarch64\n" } },
    });

    subject.installHelmOnLinux();

    expect(commands).toStrictEqual(["uname -m"]);
    expect(report.join("\n")).toContain("only the x86_64 release");
  });

  it("reports a failed download and still removes its scratch directory", async () => {
    expect.hasAssertions();

    const { commands, subject } = await createService({
      responses: {
        [`curl -fsSL -o ${ARCHIVE} ${HELM_RELEASE_URL}`]: { status: 22 },
      },
    });

    subject.installHelmOnLinux();

    expect(commands).toContain(`rm -rf ${SCRATCH}`);
    expect(commands).not.toContain(`sha256sum ${ARCHIVE}`);
    expect(report.join("\n")).toContain("could not be installed");
  });
});
