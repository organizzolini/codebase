import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeProcessRunner } from "../../../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { ReporterService } from "../../../reporter/reporter.service";

import { SoftwareGoToolsService } from "./software-go-tools.service";

import type { FakeMachine } from "../../../../../testing/fake-process-runner";
import type { GoTool } from "../../software.types";

describe(SoftwareGoToolsService, () => {
  const homes: string[] = [];
  const pluto: GoTool = {
    module: "example.com/pluto/cmd/pluto",
    name: "pluto",
    version: "1.2.3",
  };
  const build = async (
    machine: FakeMachine = {},
  ): Promise<
    ReturnType<typeof createFakeProcessRunner> & {
      home: string;
      subject: SoftwareGoToolsService;
    }
  > => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), "go-tools-"));

    homes.push(home);
    vi.spyOn(os, "homedir").mockReturnValue(home);

    const fake = createFakeProcessRunner({ platform: "linux", ...machine });
    const { module } = await buildTestingModule(SoftwareGoToolsService, {
      mocks: [ReporterService],
      providers: [{ provide: ProcessRunnerService, useValue: fake.runner }],
    });

    return {
      ...fake,
      home,
      subject: await module.resolve(SoftwareGoToolsService),
    };
  };

  afterEach(() => {
    vi.restoreAllMocks();
    for (const home of homes.splice(0)) {
      fs.rmSync(home, { force: true, recursive: true });
    }
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareGoToolsService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareGoToolsService);
  });

  it("builds a tool from its pinned tag into ~/.local/bin", async () => {
    expect.hasAssertions();

    const { commands, home, options, subject } = await build();

    subject.install(pluto);

    const line = `go install ${pluto.module}@v${pluto.version}`;

    expect(commands).toContain(line);
    expect(options.get(line)?.environment).toStrictEqual({
      GOBIN: path.join(home, ".local", "bin"),
      GOTOOLCHAIN: "auto",
    });
  });

  it("leaves a tool that is already a command alone", async () => {
    expect.hasAssertions();

    const { commands, subject } = await build({ installed: ["pluto"] });

    subject.install(pluto);

    expect(commands.some((line) => line.startsWith("go install"))).toBe(false);
  });

  it("leaves a tool already built into the install directory alone", async () => {
    expect.hasAssertions();

    const { commands, home, subject } = await build();

    fs.mkdirSync(path.join(home, ".local", "bin"), { recursive: true });
    fs.writeFileSync(path.join(home, ".local", "bin", "pluto"), "");
    subject.install(pluto);

    expect(commands.some((line) => line.startsWith("go install"))).toBe(false);
  });

  it("fails when go cannot build the tool", async () => {
    expect.hasAssertions();

    const { subject } = await build({
      responses: {
        [`go install ${pluto.module}@v${pluto.version}`]: { status: 1 },
      },
    });

    expect(() => {
      subject.install(pluto);
    }).toThrow("failed");
  });
});
