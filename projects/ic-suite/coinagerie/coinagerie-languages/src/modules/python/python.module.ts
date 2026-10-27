import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { PythonService } from "./python.service";

/** Provides the Python tokenizer. */
@Module({
  controllers: [],
  exports: [PythonService],
  imports: [ScannerModule],
  providers: [PythonService],
})
export class PythonModule {}
