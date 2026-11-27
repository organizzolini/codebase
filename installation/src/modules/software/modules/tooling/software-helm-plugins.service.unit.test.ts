import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeProcessRunner } from "../../../../../testing/fake-process-runner";
import { ProcessRunnerService } from "../../../process-runner/process-runner.service";
import { ReporterService } from "../../../reporter/reporter.service";

import { SoftwareHelmPluginsService } from "./software-helm-plugins.service";

import type { FakeMachine } from "../../../../../testing/fake-process-runner";
import type { HelmPlugin } from "../../software.types";

describe(SoftwareHelmPluginsService, () => {
  const directories: string[] = [];
  const plugin: HelmPlugin = {
    architectures: { arm64: "arm64", x64: "amd64" },
    checksums: { arm64: "aaa", x64: "aaa" },
    downloadUrl: "https://example.com/v{version}/plugin-{architecture}.tgz",
    name: "unittest",
    software: "helm-unittest",
    version: "1.2.3",
  };
  const archive = (): string => path.join(directories[0] ?? "", "plugin.tgz");
  const build = async (
    machine: FakeMachine = {},
  ): Promise<
    ReturnType<typeof createFakeProcessRunner> & {
      subject: SoftwareHelmPluginsService;
    }
  > => {
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "helm-plugin-"));

    directories.push(scratch);
    fs.mkdirSync(path.join(scratch, "plugin"));
    fs.writeFileSync(
      path.join(scratch, "plugin", "plugin.yaml"),
      "name: unittest\nplatformHooks:\n  install: curl\n",
    );

    const fake = createFakeProcessRunner({
      platform: "linux",
      ...machine,
      responses: {
        [`sha256sum ${path.join(scratch, "plugin.tgz")}`]: {
          stdout: "aaa  plugin.tgz\n",
        },
        "helm env HELM_PLUGINS": { stdout: "/home/plugins\n" },
        "helm plugin list": { stdout: "NAME VERSION\nother 1.0.0\n" },
        mktemp: {},
        "mktemp -d": { stdout: `${scratch}\n` },
        ...machine.responses,
      },
    });
    const { module } = await buildTestingModule(SoftwareHelmPluginsService, {
      mocks: [ReporterService],
      providers: [{ provide: ProcessRunnerService, useValue: fake.runner }],
    });

    return {
      ...fake,
      subject: await module.resolve(SoftwareHelmPluginsService),
    };
  };

  afterEach(() => {
    vi.restoreAllMocks();
    for (const directory of directories.splice(0)) {
      fs.rmSync(directory, { force: true, recursive: true });
    }
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SoftwareHelmPluginsService, {
      mocks: [ProcessRunnerService, ReporterService],
    });

    expect(instance).toBeInstanceOf(SoftwareHelmPluginsService);
  });

  it("leaves a plugin helm already lists alone", async () => {
    expect.hasAssertions();

    const { commands, subject } = await build({
      responses: {
        "helm plugin list": { stdout: "NAME VERSION\nunittest 1.2.1\n" },
      },
    });

    subject.install(plugin);

    expect(commands).toStrictEqual(["helm plugin list"]);
  });

  it("downloads, verifies, strips the install hook, and copies the plugin", async () => {
    expect.hasAssertions();

    const { commands, subject } = await build();
    const scratch = directories[0] ?? "";

    subject.install(plugin);

    expect(commands).toContain(
      `tar -xzf ${archive()} -C ${path.join(scratch, "plugin")}`,
    );
    expect(commands).toContain(
      `cp -R ${path.join(scratch, "plugin")}/. /home/plugins/unittest`,
    );
    expect(commands.at(-1)).toBe(`rm -rf ${scratch}`);
    expect(
      fs.readFileSync(path.join(scratch, "plugin", "plugin.yaml"), "utf8"),
    ).toBe("name: unittest\n");
  });

  it("fails when the tarball does not match its pinned checksum", async () => {
    expect.hasAssertions();

    const { subject } = await build({
      responses: { sha256sum: {} },
    });
    const scratch = directories[0] ?? "";

    vi.spyOn(process, "arch", "get").mockReturnValue("x64");

    expect(() => {
      subject.install({ ...plugin, checksums: { arm64: "bbb", x64: "bbb" } });
    }).toThrow("does not match its pinned checksum");
    expect(scratch).not.toBe("");
  });

  it("refuses a platform other than Linux", async () => {
    expect.hasAssertions();

    const { subject } = await build({ platform: "darwin" });

    expect(() => {
      subject.install(plugin);
    }).toThrow("Linux amd64 or arm64 only");
  });
});
