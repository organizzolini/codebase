import { describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../../../testing/command-line-runner";
import { RenderDirectedAcyclicGraphDataCommand } from "../render-directed-acyclic-graph-data/render-directed-acyclic-graph-data.command";
import { RenderGraphDataCommand } from "../render-graph-data/render-graph-data.command";
import { RenderTreeDataCommand } from "../render-tree-data/render-tree-data.command";

import { RenderCommand } from "./render-command.command";

const COMMANDS = [
  ["render-directed-acyclic-graph-data", RenderDirectedAcyclicGraphDataCommand],
  ["render-graph-data", RenderGraphDataCommand],
  ["render-tree-data", RenderTreeDataCommand],
] as const;

/** The flags the base class declares once for every drawing command. */
const SHARED_FLAGS = [
  "--dry-run",
  "--entities <glob>",
  "--output-json <path>",
  "--output-markdown <path>",
  "--overwrite",
  "--page <n>",
  "--schema <name>",
  "--source-uri <uri>",
];

describe(RenderCommand, () => {
  it.each(COMMANDS)("is the base of %s", (_name, command) => {
    expect(command.prototype).toBeInstanceOf(RenderCommand);
  });

  it.each(COMMANDS)("lists the flags %s inherits in its help", async (name) => {
    const { stdout } = await runCliCommandLine({ argv: [name, "--help"] });

    for (const flag of SHARED_FLAGS) {
      expect(stdout).toContain(flag);
    }
  });

  it.each(COMMANDS)("lists the options of %s in flag order", async (name) => {
    const { stdout } = await runCliCommandLine({ argv: [name, "--help"] });
    const flags = stdout
      .split("\n")
      .filter((line) => line.startsWith("  --"))
      .map((line) => line.trim().split(" ")[0] ?? "");

    expect(flags).toStrictEqual(flags.toSorted());
  });
});
