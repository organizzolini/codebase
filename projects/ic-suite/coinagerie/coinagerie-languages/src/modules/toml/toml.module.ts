import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { TomlService } from "./toml.service";

/** Provides the TOML tokenizer. */
@Module({
  controllers: [],
  exports: [TomlService],
  imports: [ScannerModule],
  providers: [TomlService],
})
export class TomlModule {}
