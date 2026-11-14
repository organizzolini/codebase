import { createCommand } from "../command/command.utilities";

import type {
  SourceCommandOptions,
  SourceCommandResult,
} from "./source-command.types";

/** Runs a TypeScript entry through swc in a child process, with color off and a sanitized environment; it never throws. */
export async function runSourceCommand(
  options: SourceCommandOptions,
): Promise<SourceCommandResult> {
  const { args = [], directory, entry, environment = {}, timeout } = options;
  const result = await createCommand(
    "node",
    ["--import", "@swc-node/register/esm-register", entry, ...args],
    {
      ...(directory === undefined ? {} : { directory }),
      environment: {
        ...environment,
        FORCE_COLOR: "0",
        // `SWC_NODE_PROJECT` outranks `TS_NODE_PROJECT` in swc-node's lookup.
        ...(options.tsconfig === undefined
          ? {}
          : { SWC_NODE_PROJECT: options.tsconfig }),
      },
      ...(timeout === undefined ? {} : { timeout }),
    },
  ).run();

  return {
    exitCode: result.exitCode ?? 1,
    stderr: result.stderr,
    stdout: result.stdout,
  };
}
