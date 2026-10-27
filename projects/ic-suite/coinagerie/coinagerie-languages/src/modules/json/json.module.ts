import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { JsonService } from "./json.service";

/** Provides the JSON tokenizer. */
@Module({
  controllers: [],
  exports: [JsonService],
  imports: [ScannerModule],
  providers: [JsonService],
})
export class JsonModule {}
