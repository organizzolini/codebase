import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { SynchronizationService } from "../synchronization/synchronization.service";

import { VscodeSettingsCommand } from "./vscode-settings.command";

/**
 * Wires the vscodeSettings command, which merges the workspace settings into
 * the VS Code Machine settings.
 */
@Module({
  controllers: [],
  exports: [VscodeSettingsCommand],
  imports: [LoggerModule],
  providers: [VscodeSettingsCommand, SynchronizationService],
})
export class VscodeSettingsModule {}
