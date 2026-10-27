import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { ShellService } from "./shell.service";

/** Provides the shell tokenizer. */
@Module({
  controllers: [],
  exports: [ShellService],
  imports: [ScannerModule],
  providers: [ShellService],
})
export class ShellModule {}
