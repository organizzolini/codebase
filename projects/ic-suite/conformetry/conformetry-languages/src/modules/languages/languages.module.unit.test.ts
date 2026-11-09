import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { JsonModule } from "../json/json.module";
import { JupyterModule } from "../jupyter/jupyter.module";
import { MarkdownModule } from "../markdown/markdown.module";
import { PythonModule } from "../python/python.module";
import { TextModule } from "../text/text.module";
import { TypescriptModule } from "../typescript/typescript.module";

import { LanguagesModule } from "./languages.module";
import { LanguagesService } from "./languages.service";

const LANGUAGE_MODULES = [
  JsonModule,
  JupyterModule,
  MarkdownModule,
  PythonModule,
  TextModule,
  TypescriptModule,
];

describe(LanguagesModule, () => {
  it("exports and provides LanguagesService", () => {
    expectModuleExports(LanguagesModule, LanguagesService);
    expectModuleProvides(LanguagesModule, LanguagesService);
  });

  it("imports and re-exports every language module", () => {
    expectModuleImports(LanguagesModule, ...LANGUAGE_MODULES);
    expectModuleExports(LanguagesModule, ...LANGUAGE_MODULES);
  });
});
