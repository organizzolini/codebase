import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { SynchronizationService } from "../synchronization/synchronization.service";

import { VscodeExtensionsCommand } from "./vscode-extensions.command";

/**
 * Wires the vscodeExtensions command, which copies `.vscode/extensions.json`
 * into both devcontainer configurations.
 */
@Module({
  controllers: [],
  exports: [VscodeExtensionsCommand],
  imports: [LoggerModule],
  providers: [VscodeExtensionsCommand, SynchronizationService],
})
export class VscodeExtensionsModule {}
