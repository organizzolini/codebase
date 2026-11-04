import { Module } from "@nestjs/common";

import { ScannerModule } from "../scanner/scanner.module";

import { SqlService } from "./sql.service";

/** Provides the SQL tokenizer. */
@Module({
  controllers: [],
  exports: [SqlService],
  imports: [ScannerModule],
  providers: [SqlService],
})
export class SqlModule {}
