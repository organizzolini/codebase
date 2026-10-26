import { Module } from "@nestjs/common";

import { CssModule } from "../css/css.module";
import { HclModule } from "../hcl/hcl.module";
import { PythonModule } from "../python/python.module";
import { ShellModule } from "../shell/shell.module";
import { SqlModule } from "../sql/sql.module";
import { TomlModule } from "../toml/toml.module";
import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesService } from "./languages.service";

/**
 * Provides the tokenizer registry, wired to every language this package
 * reads.
 */
@Module({
  controllers: [],
  exports: [LanguagesService],
  imports: [
    CssModule,
    HclModule,
    PythonModule,
    ShellModule,
    SqlModule,
    TomlModule,
    TypescriptModule,
  ],
  providers: [LanguagesService],
})
export class LanguagesModule {}
