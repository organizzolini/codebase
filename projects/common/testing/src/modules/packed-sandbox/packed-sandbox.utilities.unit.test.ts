import { describe, expect, it, vi } from "vitest";

import { createTarballSandboxRunner } from "../tarball-sandbox/tarball-sandbox.utilities";

import { installedVersion, usePackedSandbox } from "./packed-sandbox.utilities";

import type { Command } from "../command/command.types";

vi.mock("../tarball-sandbox/tarball-sandbox.utilities");

// 🧪 Tests

describe(usePackedSandbox, () => {
  const started: string[] = [];

  /** A command that records where it ran and resolves to a fixed result. */
  function startCommand(name: string): Command {
    const self: Command = {
      inDirectory: (directory) => {
        started.push(`${name} in ${directory}`);

        return self;
      },
      run: vi.fn<Command["run"]>().mockResolvedValue({
        exitCode: 0,
        stderr: "",
        stdout: "ok",
        timedOut: false,
      }),
      withEnvironment: () => self,
      withTimeout: () => self,
    };

    return self;
  }

  vi.mocked(createTarballSandboxRunner).mockResolvedValue({
    command: startCommand,
    directory: "/sandbox",
    dispose: vi.fn<() => void>(),
    tarballs: [],
  });

  const packed = usePackedSandbox({
    binary: "tool",
    packages: ["tool"],
    workspaceRoot: "/root",
  });

  it("runs the installed binary from another directory", async () => {
    const result = await packed.run("/project", ["--help"]);

    expect(started).toStrictEqual([
      "/sandbox/node_modules/.bin/tool in /project",
    ]);
    expect(result.stdout).toBe("ok");
    expect(packed.directory).toBe("/sandbox");
  });

  it("reads the version of an installed package", () => {
    expect(installedVersion(process.cwd(), "vitest")).toMatch(/^\d+\./u);
  });
});
