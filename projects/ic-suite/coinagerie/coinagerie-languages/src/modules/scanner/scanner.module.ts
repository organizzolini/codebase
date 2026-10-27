import { Module } from "@nestjs/common";

import { ScannerService } from "./scanner.service";

/** Provides the lexical scanner every non-TypeScript language shares. */
@Module({
  controllers: [],
  exports: [ScannerService],
  imports: [],
  providers: [ScannerService],
})
export class ScannerModule {}
