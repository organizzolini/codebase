import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { VscodeSettingsCommand } from "./vscode-settings.command";

/**
 * Wires the vscode-settings command, which merges the workspace settings into
 * the VS Code Machine settings. Not part of `setup`: only a devcontainer has
 * Machine settings, so its `postCreateCommand` runs it.
 */
@Module({
  controllers: [],
  exports: [VscodeSettingsCommand],
  imports: [LoggerModule],
  providers: [VscodeSettingsCommand],
})
export class VscodeSettingsModule {}
