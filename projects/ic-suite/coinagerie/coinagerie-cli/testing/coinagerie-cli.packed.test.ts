import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { usePackedSandbox } from "@codebase/testing/end-to-end";

import type { CommandResult } from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

describe("the packed coinagerie command", () => {
  const packed = usePackedSandbox({
    binary: "coinagerie",
    packages: [
      "@coinagerie/cli",
      "@coinagerie/configuration",
      "@coinagerie/core",
      "@coinagerie/languages",
      "@coinagerie/output",
      "@coinagerie/vocabulary",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });

  /** Writes a project whose source names `orbit` and `planner`; returns its directory. */
  function writeProject(): string {
    const directory = createTemporaryDirectory("coinagerie-packed-project");

    fs.mkdirSync(path.join(directory, "src"));
    fs.writeFileSync(
      path.join(directory, "src/orbit-planner.ts"),
      "export const orbitPlanner = 1;\n",
    );

    return directory;
  }

  /** Runs the installed binary from `directory`, which is outside the sandbox. */
  async function coinagerie(
    directory: string,
    args: readonly string[],
  ): Promise<CommandResult> {
    return packed.run(directory, args);
  }

  it("lists its commands under --help", async () => {
    expect.hasAssertions();

    const result = await packed.command("coinagerie", ["--help"]).run();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("collect");
    expect(result.stdout).toContain("batch");
  });

  it("collects the words of a project into a glossary", async () => {
    expect.hasAssertions();

    const result = await coinagerie(writeProject(), []);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("- **orbit**:");
    expect(result.stdout).toContain("- **planner**:");
  });

  it("writes a glossary that checks clean, then fails once a word goes missing", async () => {
    expect.hasAssertions();

    const directory = writeProject();
    const glossary = path.join(directory, "WORDS.md");
    const written = await coinagerie(directory, [
      "--output-markdown",
      "WORDS.md",
      "--write",
    ]);

    expect(written.exitCode).toBe(0);
    expect(fs.readFileSync(glossary, "utf8")).toContain("- **orbit**:");

    const clean = await coinagerie(directory, [
      "--output-markdown",
      "WORDS.md",
      "--check",
    ]);

    expect(clean.exitCode).toBe(0);

    fs.writeFileSync(
      path.join(directory, "src/comet-tracker.ts"),
      "export const cometTracker = 1;\n",
    );
    const stale = await coinagerie(directory, [
      "--output-markdown",
      "WORDS.md",
      "--check",
    ]);

    expect(stale.exitCode).toBe(1);
    expect(stale.stderr).toContain("comet");
  });
});
