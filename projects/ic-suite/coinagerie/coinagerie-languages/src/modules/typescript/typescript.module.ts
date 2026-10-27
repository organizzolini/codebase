import { Module } from "@nestjs/common";

import { TypescriptService } from "./typescript.service";

/**
 * Provides the TypeScript and JavaScript tokenizer, built on the compiler's
 * own parser.
 */
@Module({
  controllers: [],
  exports: [TypescriptService],
  imports: [],
  providers: [TypescriptService],
})
export class TypescriptModule {}
