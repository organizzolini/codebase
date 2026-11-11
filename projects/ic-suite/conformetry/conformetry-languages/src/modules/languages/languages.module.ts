import { Module } from "@nestjs/common";

import { JsonModule } from "../json/json.module";
import { JupyterModule } from "../jupyter/jupyter.module";
import { MarkdownModule } from "../markdown/markdown.module";
import { PythonModule } from "../python/python.module";
import { TextModule } from "../text/text.module";
import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesService } from "./languages.service";

/**
 * The one module a host imports to get every Language.
 *
 * Each Language also has its own module. Hosts usually want all of them, since
 * the Fallback makes the text Language a floor under every run.
 */
@Module({
  controllers: [],
  exports: [
    JsonModule,
    JupyterModule,
    LanguagesService,
    MarkdownModule,
    PythonModule,
    TextModule,
    TypescriptModule,
  ],
  imports: [
    JsonModule,
    JupyterModule,
    MarkdownModule,
    PythonModule,
    TextModule,
    TypescriptModule,
  ],
  providers: [LanguagesService],
})
export class LanguagesModule {}
