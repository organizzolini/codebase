import { STANDALONE_COMMANDS } from "./main.constants";
import { MainModule } from "./lexico-cli.module";
import { StandaloneModule } from "./standalone.module";

import type { Type } from "@nestjs/common";

// 🌎 Utilities

/**
 * The root module to boot for `argv`, the arguments after the program
 * name: `StandaloneModule` when the command names its database by URI, so
 * no Lexico database connection opens, and `MainModule` otherwise.
 */
export function rootModule(argv: readonly string[]): Type<unknown> {
  const command = argv.find((argument) => !argument.startsWith("-"));

  return command !== undefined && STANDALONE_COMMANDS.includes(command)
    ? StandaloneModule
    : MainModule;
}
