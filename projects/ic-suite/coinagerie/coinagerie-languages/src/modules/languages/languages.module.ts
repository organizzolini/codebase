import { Module } from "@nestjs/common";

import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesService } from "./languages.service";

/**
 * Provides the tokenizer registry, wired to every language this package
 * reads.
 */
@Module({
  controllers: [],
  exports: [LanguagesService],
  imports: [TypescriptModule],
  providers: [LanguagesService],
})
export class LanguagesModule {}
