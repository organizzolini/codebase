import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { HclService } from "./hcl.service";

/** Provides the HCL tokenizer. */
@Module({
  controllers: [],
  exports: [HclService],
  imports: [ScannerModule],
  providers: [HclService],
})
export class HclModule {}
