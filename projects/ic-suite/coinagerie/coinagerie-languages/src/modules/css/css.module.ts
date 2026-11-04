import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { CssService } from "./css.service";

/** Provides the CSS tokenizer. */
@Module({
  controllers: [],
  exports: [CssService],
  imports: [ScannerModule],
  providers: [CssService],
})
export class CssModule {}
