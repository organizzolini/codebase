import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeProcessRunner } from "../../../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { ReporterService } from "../../../reporter/reporter.service";

import { SoftwareGoToolsService } from "./software-go-tools.service";

import type { FakeMachine } from "../../../../../testing/fake-process-runner";
import type { GoTool } from "../../software.types";

const DEFAULT_DIRECTORY = path.join(os.homedir(), ".local", "bin");

describe(SoftwareGoToolsService, () => {
  const pluto: GoTool = {
    module: "example.com/pluto/cmd/pluto",
    name: "pluto",
    version: "1.2.3",
  };
  const build = async (
    environment: Record<string, string> = {},
    machine: FakeMachine = {},
  ): Promise<
    ReturnType<typeof createFakeProcessRunner> & {
      subject: SoftwareGoToolsService;
    }
  > => {
    vi.unstubAllEnvs();
    vi.stubEnv("GOBIN", undefined);
    for (const [name, value] of Object.entries(environment)) {
      vi.stubEnv(name, value);
    }

    const fake = createFakeProcessRunner({ platform: "linux", ...machine });
    const { module } = await buildTestingModule(SoftwareGoToolsService, {
      mocks: [ReporterService],
      providers: [
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: ProcessRunnerService, useValue: fake.runner },
      ],
    });

    return { ...fake, subject: await module.resolve(SoftwareGoToolsService) };
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareGoToolsService, {
      mocks: [ConfigService, ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareGoToolsService);
  });

  it("builds a tool from its pinned tag into ~/.local/bin by default", async () => {
    expect.hasAssertions();

    const { commands, options, subject } = await build();

    subject.install(pluto);

    const line = `go install ${pluto.module}@v${pluto.version}`;

    expect(commands).toContain(line);
    expect(options.get(line)?.environment).toStrictEqual({
      GOBIN: DEFAULT_DIRECTORY,
      GOTOOLCHAIN: "auto",
    });
  });

  it("builds into the directory GOBIN names", async () => {
    expect.hasAssertions();

    const { commands, options, subject } = await build({
      GOBIN: "/usr/local/bin",
    });

    subject.install(pluto);

    expect(commands).toContain("mkdir -p /usr/local/bin");
    expect(
      options.get(`go install ${pluto.module}@v${pluto.version}`)?.environment,
    ).toMatchObject({ GOBIN: "/usr/local/bin" });
  });

  it("leaves a tool that is already a command alone", async () => {
    expect.hasAssertions();

    const { commands, subject } = await build({}, { installed: ["pluto"] });

    subject.install(pluto);

    expect(commands.some((line) => line.startsWith("go install"))).toBe(false);
  });

  it("leaves a tool already built into the install directory alone", async () => {
    expect.hasAssertions();

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "go-tools-"));

    fs.writeFileSync(path.join(directory, "pluto"), "");

    const { commands, subject } = await build({ GOBIN: directory });

    subject.install(pluto);

    fs.rmSync(directory, { force: true, recursive: true });

    expect(commands.some((line) => line.startsWith("go install"))).toBe(false);
  });

  it("fails when go cannot build the tool", async () => {
    expect.hasAssertions();

    const { subject } = await build(
      {},
      {
        responses: {
          [`go install ${pluto.module}@v${pluto.version}`]: { status: 1 },
        },
      },
    );

    expect(() => {
      subject.install(pluto);
    }).toThrow("failed");
  });
});
