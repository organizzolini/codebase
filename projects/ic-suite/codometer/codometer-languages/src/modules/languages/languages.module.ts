import { Module } from "@nestjs/common";

import { CommentsModule } from "../comments/comments.module";

import { LanguagesService } from "./languages.service";
import { CssModule } from "./modules/css/css.module";
import { HclModule } from "./modules/hcl/hcl.module";
import { JsonModule } from "./modules/json/json.module";
import { JupyterModule } from "./modules/jupyter/jupyter.module";
import { MarkdownModule } from "./modules/markdown/markdown.module";
import { PythonModule } from "./modules/python/python.module";
import { ShellModule } from "./modules/shell/shell.module";
import { SqlModule } from "./modules/sql/sql.module";
import { TomlModule } from "./modules/toml/toml.module";
import { TypescriptModule } from "./modules/typescript/typescript.module";
import { YamlModule } from "./modules/yaml/yaml.module";

/**
 * NestJS module that gathers every language analyzer behind one service.
 */
@Module({
  controllers: [],
  exports: [LanguagesService],
  imports: [
    CommentsModule,
    CssModule,
    HclModule,
    JsonModule,
    JupyterModule,
    MarkdownModule,
    PythonModule,
    ShellModule,
    SqlModule,
    TomlModule,
    TypescriptModule,
    YamlModule,
  ],
  providers: [LanguagesService],
})
export class LanguagesModule {}
