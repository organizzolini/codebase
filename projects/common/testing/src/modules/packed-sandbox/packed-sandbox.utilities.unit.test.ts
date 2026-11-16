import { describe, expect, it, vi } from "vitest";

import { startVerdaccioPluginRunner } from "../nx-plugin-sandbox/nx-plugin-sandbox.utilities";
import { createTarballSandboxRunner } from "../tarball-sandbox/tarball-sandbox.utilities";

import {
  installedVersion,
  usePackedRegistry,
  usePackedSandbox,
} from "./packed-sandbox.utilities";

import type { Command } from "../command/command.types";
import type { VerdaccioPluginRunner } from "../nx-plugin-sandbox/nx-plugin-sandbox.types";

vi.mock("../nx-plugin-sandbox/nx-plugin-sandbox.utilities");
vi.mock("../tarball-sandbox/tarball-sandbox.utilities");

const NOT_STARTED = "read before its suite started";

/** The message a read throws, or an empty string when it does not throw. */
function messageOfRead(read: () => unknown): string {
  try {
    read();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return "";
}

// The helpers are called at file level: inside a describe they would add
// frames to their start-up stacks and tip them over the depth limit.
const started: string[] = [];
const published: unknown[] = [];

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
vi.mocked(startVerdaccioPluginRunner).mockResolvedValue({
  publish: async (options: unknown): Promise<void> => {
    published.push(options);
    await Promise.resolve();
  },
  stop: async (): Promise<void> => {},
} as unknown as VerdaccioPluginRunner);

const packed = usePackedSandbox({
  binary: "tool",
  packages: ["tool"],
  workspaceRoot: "/root",
});
const registry = usePackedRegistry({
  localScopes: ["@tool"],
  packages: ["tool"],
  workspaceRoot: "/root",
});
const readsBeforeStart = [
  () => packed.directory,
  () => packed.sandbox,
  () => packed.command("tool", []),
  () => registry.runner,
].map((read) => messageOfRead(read));

// 🧪 Tests

describe("the packed helpers", () => {
  it("runs the installed binary from another directory", async () => {
    const result = await packed.run("/project", ["--help"]);

    expect(started).toStrictEqual([
      "/sandbox/node_modules/.bin/tool in /project",
    ]);
    expect(result.stdout).toBe("ok");
    expect(packed.directory).toBe("/sandbox");
  });

  it("hands out the sandbox and plain commands once started", () => {
    expect(packed.sandbox.directory).toBe("/sandbox");
    expect(packed.command("tool", [])).toBeDefined();
  });

  it("publishes the packed packages to the started registry", () => {
    expect(published).toStrictEqual([
      { packages: ["tool"], workspaceRoot: "/root" },
    ]);
    expect(registry.runner).toBeDefined();
  });

  it("refuses every read before its suite started", () => {
    expect(readsBeforeStart).toHaveLength(4);
    expect(readsBeforeStart.every((m) => m.includes(NOT_STARTED))).toBe(true);
  });

  it("reads the version of an installed package", () => {
    expect(installedVersion(process.cwd(), "vitest")).toMatch(/^\d+\./u);
  });
});
