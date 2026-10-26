import { Module } from "@nestjs/common";

import { PythonModule } from "../python/python.module";
import { ShellModule } from "../shell/shell.module";
import { SqlModule } from "../sql/sql.module";
import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesService } from "./languages.service";

/**
 * Provides the tokenizer registry, wired to every language this package
 * reads.
 */
@Module({
  controllers: [],
  exports: [LanguagesService],
  imports: [PythonModule, ShellModule, SqlModule, TypescriptModule],
  providers: [LanguagesService],
})
export class LanguagesModule {}
